//@wrap:closure:JSPG.MenuHandler:

this.items = []
this.currentScreen = null
this.SELECTORS = {
    CONTAINER: "#menu",
    OVERLAY: "#overlay",
    BUTTON_BY_POS: "#menu button[posid={pos}]"
}
this.HTML = {
    BUTTON_POS_SUBCLS: 'menu-button-idx-{pos}',
    BUTTON_CLS: 'menu-button menu-button-idx-{pos}',
    BUTTON: '<button {attrs}>{icon}{title}</button>'
}
this.log = new Logger(
    JSPG.Logging.MENU_HANDLER.id,
    JSPG.Logging.MENU_HANDLER.level
)

this.Constants = {
    CSS_BASE_CLASS: 'menu-button',
    CSS_IDX_CLASS_PREFIX: 'menu-button-idx-'
}

this.Button = function (tag, positionIdx, title, icon, onClick, style=null, attrs=null) {
    this.positionIdx = positionIdx
    this.tag = tag
    this.title = title
    this.icon = icon
    this.onClick = onClick
    this.attrs = new JSPG.Entities.Attributes(attrs)
    
    this.get = function () {
        const iconElement = this.icon == null ? '' : this.icon.get()
        const html = JSPG.MenuHandler.HTML.BUTTON.format({
            attrs: this.attrs.compose(),
            icon: iconElement,
            title: this.title
        })
        return html
    }

    this.find = function () {
        return $(JSPG.MenuHandler.SELECTORS.BUTTON_BY_POS.format('pos', this.positionIdx))
    }

    this.updatePositionIdx = function (newPositionIdx) {
        const $element = this.find()
        $element.attr({posid: newPositionIdx})
        $element.removeClass(JSPG.MenuHandler.HTML.BUTTON_POS_SUBCLS.format('pos', this.positionIdx))
        $element.addClass(JSPG.MenuHandler.HTML.BUTTON_POS_SUBCLS.format('pos', this.positionIdx))

        this.positionIdx = newPositionIdx
    }

    this.enable = function () { this.find().attr('disabled', false) }
    this.disable = function () { this.find().attr('disabled', true) }

    {
        this.attrs.modify({
            class: JSPG.MenuHandler.HTML.BUTTON_CLS.format('pos', positionIdx),
            tag: tag,
            style: style,
            onclick: "JSPG.MenuHandler.OnMenuItemClick(this)",
            posid: positionIdx,
        }, JSPG.Constants.OPERATIONS.APPEND)
    }
}

// Public-like
this.AddMenuItem = function (tag, title, iconData, onclick, style=null, attrs=null) {
    const icon = iconData == null
                 ? null
                 : (new JSPG.Entities.Icon(iconData)).asMenuItemIcon()
    const item = new this.Button(
                    tag, positionIdx=this.items.length,
                    title, icon,
                    onclick,
                    style, attrs)
    this.items.push(item)
    const html = item.get()
    $(this.SELECTORS.CONTAINER).append(html)
}

this.RemoveMenuItem = function (findBy) {
    // findBy may be integer (position idx) or string (tag name)
    [idx, item] = this.findMenuItem(findBy)
    if (item == null) return

    item.find().remove()
    this.items.splice(idx, 1)
    this.updateMenuItems()
}

this.ClearMenuItems = function () {
    for (let idx = 0; idx < this.items.length; ++idx) {
        $btn = this.items[idx].find()
        $btn.remove()
    }
    this.items.purge()
}

this.DisableMenuItem = function (findBy) {
    [idx, item] = this.findMenuItem(findBy)
    if (item == null) return

    item.disable()
}

this.EnableMenuItem = function (findBy) {
    [idx, item] = this.findMenuItem(findBy)
    if (item == null) return

    item.enable()
}

this.GetCurrentScreen = function () {
    return this.currentScreen;
}

this.ShowScreen = function (screenName) {
    const screenConfig = JSPG.Screens[screenName]
    const typeKey = Object.keys(screenConfig).find(key => key.toLowerCase() == 'type')
    if (!typeKey) {
        this.log.err(`ERROR on attempt to create unknown screen`)
        return
    }

    const screenTemplate = JSPG.Maps.SCREEN_TEMPLATE_BY_TOKEN[screenConfig[typeKey]]
    if (!screenTemplate) {
        this.log.err(`ERROR on attempt to create screen of unknown type [{screenConfig[typeKey]}]`)
        return
    }
    
    const screen = new screenTemplate()
    screen.fromConfig(screenConfig)

    this.currentScreen = screen
    this.UpdateScreenContent()

    $(this.SELECTORS.OVERLAY).width("100%")
}

this.UpdateScreenContent = function (html) {
    // Replace screen content with given HTML or by screen's Get() method
    if (html != undefined) {
        $(this.SELECTORS.OVERLAY).html(html)
    }
    if (this.currentScreen == null) return
    $(this.SELECTORS.OVERLAY).html(this.currentScreen.Get())
}

this.HideScreen = function () {
    $(this.SELECTORS.OVERLAY).width("0%")
    this.currentScreen = null
    this.UpdateScreenContent(html='')
}

// Not for public use
this.OnMenuItemClick = function (btn) {
    const posid = btn.getAttribute('posid')
    this.log.info('{OnMenuItemClick}', `Clicked item ${btn} with posId=${posid}`)

    return this.items[posid].onClick()
}


this.AddMainMenuButton = function () {
    this.AddMenuItem(tag='main-menu-button',
                     title='Menu',
                     iconData=null,
                     onClick=() => { this.ShowScreen('Main') },
                     null,
                     {class: 'menu-button-main'})
}

// Private-like
this.updateMenuItems = function () {
    for (let idx = 0; idx < this.items.length; ++idx) {
        this.items[idx].updatePositionIdx(idx)
    }
}

this.findMenuItem = function (findBy) {
    // findBy may be integer (position idx) or string (tag name)
    let idx = (typeof findBy == typeof "")
              ? this.items.findIndex(item => item.tag == findBy)
              : findBy
    if (idx < 0 || idx >= this.items.length) return [-1, null]

    return [idx,  this.items[idx]]
}

this.onScreenElementClick = function (eventHandlerIdx) {
    this.log.info('{onScreenElementClick}', `Handler id = ${eventHandlerIdx}`)
    const handler = this.currentScreen.onClickHandlers[eventHandlerIdx]
    if (handler == undefined) return

    this.log.info('{onScreenElementClick}', 'Invoking event handler for click')
    handler()
}

this.addSystemScreens = function () {
    JSPG.Screens.SaveGameScreen = {
        type: JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU,
        title: 'Save Game',
        pre_exec: JSPG.Persistence.formatSaveMenuScreen.bind(JSPG.Persistence)
    }

    JSPG.Screens.LoadGameScreen = {
        type: JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU,
        title: 'Load Game',
        pre_exec: JSPG.Persistence.formatLoadMenuScreen.bind(JSPG.Persistence)
    }

    JSPG.Screens.AboutScreen = {
        type: JSPG.Constants.SCREENS.TYPES.SIMPLE_TEXT,
        title: 'About',
        content: [
            `${JSPG.Meta.name}`,
            `by ${JSPG.Meta.author}`,
            `Version ${JSPG.Meta.version}`,
            `Game UID: ${JSPG.Meta.guid}`,
            '',
            `Powered by JSPG version ${JSPG.Meta.JSPGVersion}`
        ]
    }
}
