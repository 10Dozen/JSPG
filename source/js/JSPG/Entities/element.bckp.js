//@wrap:function:JSPG.Entities.Element:tag
// HTML element object. Should be used with JSPG.ElementsHandler for proper handling.
this.id = JSPG.uid()
this.tag = tag
this.html_tag = ''
this.html_template = ''
this.content = ''
this.eventHandlers = []
this.attrs = new JSPG.Entities.Attributes({uid: this.id, tag: this.tag})
this.EHSTRUCT = JSPG.Constants.INDEXES.ELEMENT_EVENT_HANDLER_STRUCTURE

this.log = new Logger(
    JSPG.Logging.ENTITIES.ELEMENT.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.ELEMENT.level
)

// Specifier functions - should be used only once after element creation
this.AsLabel = function (text) {
    this.html_tag = JSPG.Constants.HTML.TAGS.LABEL
    this.html_template = JSPG.Constants.HTML.TEMPLATES.FULL
    this.content = text
    this.finalize()
    return this
}

this.AsImage = function (src) {
    this.html_tag = JSPG.Constants.HTML.TAGS.IMAGE
    this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
    this.attrs.modify('src', src)
    this.finalize()
    return this
}

this.AsClick = function (text) {
    this.html_tag = JSPG.Constants.HTML.TAGS.CLICK
    this.html_template = JSPG.Constants.HTML.TEMPLATES.FULL
    this.content = text
    this.finalize()
    return this
}

this.AsInput = function (defaultValue, placeholderText) {
    this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
    this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
    this.attrs.modify({
        type: 'text',
        value: defaultValue,
        placeholder: placeholderText
    })
    this.finalize()
    return this
}

// Public functions
this.Get = function () {
    // Returns HTML code of the element
    const html = this.html_template.format({
        tag: this.html_tag,
        attrs: this.attrs.compose(),
        content: this.content
    })
    this.log.debug('{Get}', html)
    return html
}

this.Find = function () {
    // Returns jQuery node of the elemnet
    const $node = $(`${this.html_tag}[uid=${this.id}]`)
    if ($node.length == 0) return
    return $($node[0])
}

this.Value = function () {
    const $node = this.Find()
    if (!$node) return
    return $node.val()
}

this.Enable = function (clearEventListeners=true) {
    // Assigns eventhandler to HTML node in document
    const $node = this.Find()
    if (!$node) return

    $node.prop('disabled', false)

    if (clearEventListeners) $node.off()
    for (let ehIdx = 0; ehIdx < this.eventHandlers.length; ++ehIdx) {
        const handler = this.eventHandlers[ehIdx]
        const handlerName = handler[this.EHSTRUCT.HANDLER_IDX]
        $node.on(handlerName, event => JSPG.ElementsHandler.runElementsEventHandlerByIndex(this, handler, event))
    }
}

this.Disable = function () {
    // Removes eventhandler from HTML node in document
    this.eventHandlers.purge()
    const $node = this.Find()
    if (!$node) return

    $node.off()
    $node.prop('disabled', true)
    this.log.info('{Disable}', `Element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
}

this.AddEventHandler = function (eventName, callback, use_limit=-1, mark_disabled=false) {
    this.eventHandlers.push([eventName.toLowerCase(), callback, use_limit, mark_disabled])
}

this.RemoveEventHandler = function (eventName) {
    // Looks for Event listeners in element's event handler list
    // and removes it from both list and html node
    let indicies = []
    let ehs = []
    for (let idx = 0; idx < this.eventHandlers.length; ++idx) {
        if (this.eventHandlers[idx][this.EHSTRUCT.HANDLER_IDX] != eventName.toLowerCase()) continue
        indicies.push(idx)
        ehs.push(this.eventHandlers[idx][this.EHSTRUCT.HANDLER_IDX])
    }

    if (indicies.length == 0) return
    indicies.reverse()

    $node = this.Find()
    for (let idx = 0; idx < indicies.length; ++idx) {
        this.eventHandlers.splice(indicies[idx], 1)
        if (!$node) continue

        $node.off(ehs[idx])
        this.log.info('{RemoveEventHandler}',
            `Event handler [${ehs[idx]}] for element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was removed!`)
    }
}

this.finalize = function () {
    delete this['AsLabel']
    delete this['AsImage']
    delete this['AsClick']
    delete this['AsInput']
    delete this['finalize']
}
