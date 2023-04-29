//@wrap:function:JSPG.ScreenTemplates.simpleMenu:

this.type = JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU
this.title = ''
this.content = []
this.onClickHandlers = []
this.HEADER_CLASS = 'simple-menu-header'
this.CONTENT_CLASS = 'simple-menu-content'
this.FIELDS = {
    TITLE: 'title',
    CONTENT: 'content',
    PRE_EXEC: 'pre_exec'
}
this.FIELDS_CONTENT = {
    TITLE: 'title',
    NAVIGATETO: 'navigateto',
    ONCLICK: 'onclick',
}
this.log = new Logger(
    JSPG.Logging.ENTITIES.SCREEN.id.replace('$id', this.type),
    JSPG.Logging.ENTITIES.SCREEN.level
)

this.fromConfig = function (config) {
    propCallbacks = {}
    propCallbacks[this.FIELDS.CONTENT] = list => {
        const normalizedList = []
        list.forEach(el => {
            let normalizedElement = {}
            JSPG.normalizeAndCopyToObject(el,
                normalizedElement,
                Object.values(this.FIELDS_CONTENT))
            normalizedList.push(normalizedElement)
        })
        return normalizedList
    }

    JSPG.normalizeAndCopyToObject(config, this,
                                  Object.values(this.FIELDS),
                                  propCallbacks)

    if (!this.hasOwnProperty(this.FIELDS.PRE_EXEC)) return this

    // Pre_exec may change fields read from config
    // and changed fields may need again normalization
    this.pre_exec(this)
    JSPG.normalizeAndCopyToObject(this, null, Object.values(this.FIELDS), propCallbacks)

    return this
}

this.Get = function () {
    const html = []
    this.onClickHandlers.length = 0
    if (this.title != '') {
        html.push(`<div class='${this.HEADER_CLASS}'>${this.title}</div>`)
    }

    html.push(`<div class='${this.CONTENT_CLASS}'>`)
    for (let idx = 0; idx < this.content.length; ++idx) {
        const content = this.content[idx]
        this.log.debug('{Get}', `Content idx: ${idx}`)

        const onClickCode = []
        if (typeof content.onclick != 'undefined') {
            this.onClickHandlers[idx] = content.onclick
            onClickCode.push(`JSPG.MenuHandler.onScreenElementClick(${idx})`)

            this.log.debug('{Get}', 'OnClick code defined - setting on click handler')
        }
        if (typeof content.navigateto != 'undefined') {
            onClickCode.push(` JSPG.MenuHandler.ShowScreen(\"${content.navigateto}\") `)
            this.log.debug('{Get}', 'NavigateTo defined - adding destination')
        }
        this.log.debug('{Get}', 'On click code: ', onClickCode)

        this.onClickHandlers.push(content.onClick)
        html.push(`<a href='javascript:void(0)' onclick='${onClickCode.join(';')}'>${content.title}</a>`)
    }
    html.push(`</div>`)
    html.push(`<a href="javascript:void(0)" class="closebtn" onclick="JSPG.MenuHandler.HideScreen()">&times;</a>`)

    return html.join('')
}
