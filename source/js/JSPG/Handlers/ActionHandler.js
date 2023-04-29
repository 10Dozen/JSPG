//@wrap:closure:JSPG.ActionHandler:
this.actions = []
this.SELECTORS = {
    CONTAINER: '#actions',
    BUTTONS: '.action-btn',
    BUTTON_BY_ID: '.action-btn[uid={uid}]',
}
this.HTML = {
    BUTTON: '<div class="action-btn" uid={uid}></div>'
}
this.log = new Logger(
    JSPG.Logging.ACTION_HANDLER.id,
    JSPG.Logging.ACTION_HANDLER.level
)


this.onHotkeySelection = function (e) {
    if (!JSPG.Settings.allowHotkeyActionSelection) return
    if (e.keyCode < 49
        || e.keyCode > (49 + JSPG.ActionHandler.actions.length - 1)
        || $("#overlay").width() > 0
        || $(document.activeElement).is('input, textarea')
    ) return

    const idx = e.keyCode - 49
    console.log(`Action ${idx} selected!`)
    JSPG.ActionHandler.onActionSelected(JSPG.ActionHandler.actions[idx].id)
}

this.getActionById = function (id) {
    return this.actions.find(action => action.id === id)
};

this.clearActionList = function () {
    this.actions.purge()
};

this.showSceneActions = function (actions) {
    this.clearActionList();

    this.actions = actions
    this.log.info('{setSceneActions}', `Preparing ${actions.length} actions`)

    const $container = $(this.SELECTORS.CONTAINER)
    for (let idx = 0; idx < actions.length; ++idx) {
        const action = actions[idx]
        this.log.debug('{setSceneActions}', `Id: ${action.id}, Name: ${action.name}`);

        $container.append(this.HTML.BUTTON.format('uid', action.id))
        const $btn = $(this.SELECTORS.BUTTON_BY_ID.format('uid', action.id))

        const hotkeyIcon = (JSPG.Settings.allowHotkeyActionSelection && JSPG.Settings.showHotkeyActionDefaultIcons)
                           ? new JSPG.Entities.Icon({text: idx+1, class: 'action-btn-icon-hotkey'}).asActionIcon().get()
                           : ''

        const html = action.icon == null
                     ? `${hotkeyIcon}${action.name}`
                     : `${hotkeyIcon}${action.icon.get()}${action.name}`
        $btn.html(html)
        $btn.off()
        $btn.on("click", () => this.onActionSelected(action.id))
    }

    $container.css("min-height", $container.height() + "px");

    setTimeout(() => {
        $(this.SELECTORS.CONTAINER).css("opacity", 1)
    }, JSPG.Constants.TIMEOUTS.ACTION.SHOW_OPTIONS);
};

this.onActionSelected = function (actionId) {
    JSPG.ElementsHandler.disableElements()
    this.hideSceneActions()
    const action = this.getActionById(actionId)

    const drawTimeout = this.showActionDescription(action)
    this.executeAction(action, drawTimeout)
}

this.showActionDescription = function (action) {
    if (action.type == JSPG.Constants.BLOB_TYPES.HIDDEN) return
    const contentfullBlobs = action.parseDescriptions()
    const frames = contentfullBlobs.length
    if (frames == 0) return 0

    const baseTimeout = JSPG.Constants.TIMEOUTS.ACTION.SHOW_ANSWER
    let timeout = baseTimeout
    for (let frame = 0; frame < frames; ++frame) {
        timeout += JSPG.Constants.TIMEOUTS.SCENE.STEP * frame

        JSPG.SceneHandler.drawBlob(contentfullBlobs[frame], timeout, frame == 0)
    }

    return timeout
}

this.executeAction = function (action, drawTimeout) {
    setTimeout(() => {
        // If action exec code return False - GoTo will be ignored (e.g. action code invokes goTo)
        const execResult = JSPG.execCode(action.exec)
        if (
            (execResult != undefined && !execResult)
            || action.goto === ''
        ) {
            this.log.debug('{OnActionExecute}', 'Skip action\'s GoTo')
            return
        }

        this.log.debug('{OnActionExecute}', `GoTo: ${action.goto}`);
        JSPG.SceneHandler.goTo(action.goto)
    }, JSPG.Constants.TIMEOUTS.ACTION.EXECUTE + drawTimeout);
}

this.hideSceneActions = function () {
    $(this.SELECTORS.CONTAINER).css("opacity", 0)
    $(this.SELECTORS.BUTTONS).off()
    $(this.SELECTORS.BUTTONS).remove()
};

{
    if (JSPG.Settings.allowHotkeyActionSelection) {
        document.addEventListener('keyup', this.onHotkeySelection)
    }
}
