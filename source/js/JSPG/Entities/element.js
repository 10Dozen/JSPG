//@wrap:function:JSPG.Entities.Element:tag
// HTML element object.
// Should be registered by JSPG.ElementsHandler.RegisterElement(element) for proper handling.

this.id = JSPG.uid()
this.tag = tag
this.content = ''

this.html_tag = ''
this.html_template = ''

this.attrs = new JSPG.Entities.Attributes({
    uid: this.id,
    tag: this.tag
})
this.eventHandler = new JSPG.Entities.EventHandler()

this.element = null
this.log = new Logger(
    JSPG.Logging.ENTITIES.ELEMENT.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.ELEMENT.level
)

// Constructor functions
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

this.AsCustom = function (html_tag, isFullForm=true, content='') {
    this.html_tag = html_tag
    this.html_template = isFullForm
                         ? JSPG.Constants.HTML.TEMPLATES.FULL
                         : JSPG.Constants.HTML.TEMPLATES.SHORT
    this.content = content
    this.finalize()
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

this.Value = function () {
    if (!this.element) return
    return this.element.value
}

this.Enable = function () {
    // Assigns eventhandler to HTML node in document
    const element = this.findInDOM()
    if (!element) return

    element.disabled = false
    this.eventHandler.apply(element, this)
}

this.Disable = function () {
    // Removes eventhandler from HTML node in document
    this.eventHandler.clear(this.element)

    if (this.element) this.element.disabled = true
    this.log.info('{Disable}', `Element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
}

this.AddEventHandler = function (eventName, callback, tag, use_limit, mark_disabled) {
    this.eventHandler.add(eventName, callback, tag, use_limit, mark_disabled)
}

this.RemoveEventHandler = function (eventName, tag) {
    // Looks for Event listeners in element's event handler list
    // and removes it from both list and html node
    this.eventHandler.remove(this.element, eventName, tag)
}

// Private
this.findInDOM = function () {
    if (!this.element) {
        const $node = $(`${this.html_tag}[uid=${this.id}]`)
        if ($node.length > 0) this.element = $node[0]
    }

    return this.element
}

this.finalize = function () {
    delete this['AsLabel']
    delete this['AsImage']
    delete this['AsClick']
    delete this['AsInput']
    delete this['AsCustom']
    delete this['finalize']
}
