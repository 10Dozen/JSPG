//@wrap:closure:JSPG.ElementsHandler:
// Handles dynamically created element during scene presentation and transitions
this.elements = new Map()  // list of custom elements objects
this.log = new Logger(
    JSPG.Logging.ELEMENTS_HANDLER.id,
    JSPG.Logging.ELEMENTS_HANDLER.level
)

this.RegisterElement = function (element) {
    const key = element.tag ? element.tag : `${element.html_tag}-${element.id}`
    this.elements.set(key, element)
}

this.UnregisterElement = function (elementOrTag) {
    let key = ''
    if (typeof elementOrTag == typeof '') {
        key = elementOrTag
    } else {
        for (const items of this.elements) {
            if (items[1] == elementOrTag) {
                key = items[0]
                break
            }
        }
    }

    if (!this.elements.has(key)) return
    this.elements.delete(key)
}

this.FindByTag = function (tag) {
    return this.elements.get(tag)
}

// ------------------------------
this.enableElements = function () {
    // Activates elements. Invoked on scene rendering.
    for (const element of this.elements.values()) {
        element.Enable()
    }
}

this.disableElements = function () {
    // Deactivats elements. Invoked on action selection.
    for (const element of this.elements.values()) {
        element.Disable()
    }
}

this.clearElementsList = function () {
    this.elements.clear()
}

this.runElementsEventHandler = function (element, eventName, handler, event) {
    const EHSTRUCT = JSPG.Constants.SCHEMAS.EVENT_HANDLER
    const handlerTag = handler.get(EHSTRUCT.TAG)
    const callback = handler.get(EHSTRUCT.CALLBACK)
    const use_limit = handler.get(EHSTRUCT.USE_LIMIT)
    const disableOnLimit = handler.get(EHSTRUCT.DISABLE_ON_LIMIT)

    this.log.info('{RunEventHandler}',
        `Running event handler for event [${eventName}/${handlerTag}] for element [${element.html_tag}/uid=${element.id} tag=${element.tag}]`)
    callback(element, event)

    if (use_limit == -1) return

    const new_limit = use_limit - 1
    handler.set(EHSTRUCT.USE_LIMIT, new_limit)
    if (new_limit > 0) return

    this.log.info('{RunEventHandler}',
        `Event handler reached its limit for [${eventName}/${handlerTag}] for element [${element.html_tag}/uid=${element.id} tag=${element.tag}]`)

    element.RemoveEventHandler(eventName, handlerTag)
    if (disableOnLimit) element.Disable()
}
