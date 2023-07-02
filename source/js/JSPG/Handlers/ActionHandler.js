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

    // Track keys 0...9
    if (e.keyCode < 49
        || e.keyCode > (49 + JSPG.ActionHandler.actions.length - 1)
        || $("#overlay").width() > 0
        || $(document.activeElement).is('input, textarea')
    ) return

    const idx = e.keyCode - 49
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

    const execTimeout = this.executeAction(action)
    const drawTimeout = this.showActionDescription(action, execTimeout)
    this.executePostAction(action, drawTimeout)
}

this.executeAction = function (action) {
    const timeout = JSPG.Constants.TIMEOUTS.ACTION.BEFORE_EXECUTE
    if (!action.exec) return 0

    setTimeout(() => {
        // If action exec code returns False - GoTo will be ignored (e.g. action code invokes goTo)
        const execResult = action.exec(action)
        if (execResult != undefined && !execResult) {
            action.condition = false
            this.log.debug('{executeAction}', 'Skip action\'s GoTo')
            return
        }
    }, timeout);

    return (timeout + JSPG.Constants.TIMEOUTS.ACTION.AFTER_EXECUTE)
}

this.showActionDescription = function (action, offsetTimeout) {
    if (action.type == JSPG.Constants.BLOB_TYPES.HIDDEN) return offsetTimeout

    const contentfullBlobs = JSPG.BlobBuilder.createBlobsFrom(action)
    const frames = contentfullBlobs.length
    if (frames == 0) return offsetTimeout

    let timeout = offsetTimeout + JSPG.Constants.TIMEOUTS.ACTION.SHOW_ANSWER
    for (let frame = 0; frame < frames; ++frame) {
        timeout += JSPG.Constants.TIMEOUTS.SCENE.STEP * frame

        JSPG.SceneHandler.drawBlob(contentfullBlobs[frame], timeout, frame == 0)
    }

    return (timeout + JSPG.Constants.TIMEOUTS.ACTION.AFTER_ANSWER)
}

this.executePostAction = function (action, offsetTimeout) {
    if (!action.goto) return

    setTimeout(() => {
        if (!action.condition) {
            this.log.info('{executePostAction}', 'Action is unavailable. Skip GoTo.')
            return 0
        }

        this.log.debug('{executePostAction}', 'GoTo to be defined.')
        const targetScene = JSPG.parseParamValue(action.goto)

        this.log.debug('{executePostAction}', `GoTo for action: ${targetScene}`)
        JSPG.SceneHandler.goTo(targetScene)
    }, offsetTimeout)
}

this.hideSceneActions = function () {
    $(this.SELECTORS.CONTAINER).css("opacity", 0)
    $(this.SELECTORS.BUTTONS).off()
    $(this.SELECTORS.BUTTONS).remove()
};

// On constuct
{
    if (JSPG.Settings.allowHotkeyActionSelection) {
        document.addEventListener('keyup', this.onHotkeySelection)
    }
}
