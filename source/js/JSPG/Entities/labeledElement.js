//@wrap:function:JSPG.Entities.LabeledElement:label='', tag=null, align='left'
// Constructor of HTML element with label (e.g. checkbox, radio, slider or meter)
// Should be registered by JSPG.ElementsHandler.RegisterElement(element) for proper handling.

this.id = JSPG.uid()
this.tag = tag
this.labelContent = label
this.align = align.toLowerCase()

this.html_tag = ''
this.html_template = ''
this.isCheckable = false

this.attrs = new JSPG.Entities.Attributes({
    tag: this.tag,
    uid: this.id
})
this.labelAttrs = new JSPG.Entities.Attributes({
    tag: `${this.tag}-label`,
    uid: `${this.id}-label`
})
this.eventHandler = new JSPG.Entities.EventHandler()

this.element = null
this.label = null
this.log = new Logger(
    JSPG.Logging.ENTITIES.LABELED_ELEMENT.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.LABELED_ELEMENT.level
)

// Constructor functions
this.AsCheckbox = function (isChecked=false, value='', name='') {
    this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
    this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
    console.log('===========')
    console.log(isChecked)
    this.attrs.modify({
        type: 'checkbox',
        checked: isChecked ? 'true' : null,
        value: value,
        name: name,
    })
    this.isCheckable = true
    this.attachLabel(`checkbox-${this.id}`)
    this.finalize()

    return this
}

this.AsRadio = function (isSelected=false, value='', name='') {
    this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
    this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
    this.attrs.modify({
        type: 'radio',
        checked: isSelected ? 'true' : null,
        value: value,
        name: name
    })
    this.isCheckable = true
    this.attachLabel(`radio-${this.id}`)
    this.finalize()

    return this
}

this.AsSlider = function (min=0, max=10, value=5, step=1, name='',
    labelUpdateCallback=(element,value)=>element.SetLabel(value),
    callbackTag='default'
) {
    this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
    this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
    this.attrs.modify({
        type: 'range',
        name: name,
        min: min,
        max: max,
        value: value,
        step: step
    })
    if (labelUpdateCallback) {
        this.AddEventHandler(
            'input',
            (element, event) => labelUpdateCallback(element, event.target.value),
            callbackTag
        )
    }
    this.attachLabel(`range-${this.id}`)
    this.finalize()

    return this
}

this.AsMeter = function (min=0, max=10, value=5, low=0, high=10, optimum=5) {
    this.html_tag = JSPG.Constants.HTML.TAGS.METER
    this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
    this.attrs.modify({
        min: min,
        max: max,
        value: value,
        low: low,
        high: high,
        optimum: optimum,
    })
    this.attachLabel(`meter-${this.id}`)
    this.finalize()

    return this
}

// Publis function
this.Get = function () {
    // Returns HTML code of 2 elements - element and it's label
    const elementHtml = this.html_template.format({
        tag: this.html_tag,
        attrs: this.attrs.compose()
    })
    const labelHtml = JSPG.Constants.HTML.TEMPLATES.LABEL.format({
        attrs: this.labelAttrs.compose(),
        content: this.labelContent
    })
    const html = align == JSPG.Constants.ALIGN.RIGHT
                 ? `${labelHtml}${elementHtml}`
                 : `${elementHtml}${labelHtml}`

    this.log.debug('{Get}', html)
    return html
}

this.Value = function () {
    if (!this.element) return
    
    return this.isCheckable ? this.element.checked : this.element.value
}

this.Enable = function () {
    // Assigns eventhandler to HTML node in document
    const element = this.findInDOM()
    if (!element) return

    element.disabled = false
    this.eventHandler.apply(element, this)
}

this.Disable = function () {
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

this.SetLabel = function (text) {
    this.labelContent = text
    if (!this.label) return
    this.label.innerHTML = text
}

// -----------------------------------------
this.attachLabel = function(attachToID) {
    this.attrs.modify('id', attachToID)
    this.labelAttrs.modify({
        id: `label-for-${attachToID}`,
        for: attachToID,
    })
}

this.findInDOM = function () {
    if (!this.element) {
        const $node = $(`${this.html_tag}[uid=${this.id}]`)
        if ($node.length > 0) this.element = $node[0]

        const $labelNode = $(`label[uid=${this.id}-label]`)
        if ($labelNode.length > 0) this.label = $labelNode[0]
    }

    return this.element
}

this.finalize = function () {
    delete this['AsCheckbox']
    delete this['AsRadio']
    delete this['AsSlider']
    delete this['AsMeter']
    delete this['attachLabel']
    delete this['finalize']
}
