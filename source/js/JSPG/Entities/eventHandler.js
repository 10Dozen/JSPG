//@wrap:function:JSPG.Entities.EventHandler:

/* In format:
    eventName1: Map(
       ...handler(Map(callback, use_limit, mark_disabled))
        __tagged: Map(tag, ...handler),
    ),
    eventNae2: ...
*/
this.listeners = new Map()

this.add = function (eventName, callback, tag=null, use_limit=-1, mark_disabled=false) {
    const EHSTRUCT = JSPG.Constants.SCHEMAS.EVENT_HANDLER
    eventName = eventName.toLowerCase()
    
    if (eventName.split('.').length == 1) {
        eventName = `${eventName}.user_defined`
    }
    
    const handlersMap = this.listeners.has(eventName)
                        ? this.listeners.get(eventName)
                        : new Map()

    if (!tag) tag = JSPG.uid()
    const handler = new Map().set(EHSTRUCT.TAG, tag)
                             .set(EHSTRUCT.CALLBACK, callback)
                             .set(EHSTRUCT.USE_LIMIT, use_limit)
                             .set(EHSTRUCT.DISABLE_ON_LIMIT, mark_disabled)

    console.log(`{eventHandler} Add for ${eventName}`)
    console.log(handler)

    handlersMap.set(tag, handler)
    this.listeners.set(eventName, handlersMap)
}

this.remove = function (DOMElement, eventName, tag=null) {
    // Looks for Event listeners in element's event handler list
    // and removes it from both list and html node
    eventName = eventName.toLowerCase()
    if (eventName.split('.').length == 1) {
        eventName = `${eventName}.user_defined`
    }
    if (!this.listeners.has(eventName)) return

    // If no tag given - remove all listeners for event name
    if (!tag) {
        this.listeners.delete(eventName)
        if (DOMElement) $(DOMElement).off(eventName)
        return
    }

    // Otherwise - search and remove tagged listener
    const handlersMap = this.listeners.get(eventName)
    if (!handlersMap.has(tag)) return null

    const handler = handlersMap.get(tag)
    DOMElement.removeEventListener(
        eventName,
        handler.get(JSPG.Constants.SCHEMAS.EVENT_HANDLER.CALLBACK)
    )
    handlersMap.delete(tag)
}

this.apply = function (DOMElement, elementRef) {
    // Applies eventListeners to DOM element
    $(DOMElement).off()

    for (const listener of this.listeners) {
        const eventName = listener[0]
        const handlersMap = listener[1]

        for (const handler of handlersMap.values()) {
            $(DOMElement).on(eventName, event => {
                JSPG.ElementsHandler.runElementsEventHandler(
                    elementRef,
                    eventName,
                    handler,
                    event
                )
            })
        }
    }
}

this.clear = function (DOMElement) {
    this.listeners.clear()
    $(DOMElement).off()
}
