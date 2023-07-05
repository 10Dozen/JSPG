//@wrap:function:JSPG.Entities.ElementsGroup:tag=null, align='left', joinWith='<br>'
//@inline:fake_named_params

this.id = JSPG.uid()
this.tag = tag
this.align = align
this.joinWith = joinWith
this.value = null

this.html_tag = JSPG.Constants.HTML.TAGS.GROUP

this.attrs = new JSPG.Entities.Attributes({uid: this.id, tag: this.tag})
this.eventHandler = new JSPG.Entities.EventHandler()

this.nestedElements = []

this.log = new Logger(
    JSPG.Logging.ENTITIES.ELEMENTS_GROUP.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.ELEMENTS_GROUP.level
)

// Constructor functions
this.AsRadiobuttons = function (options, defaultIdx=0, values=null) {
    // Configure element to Radiobutton set
    const name = `radiobuttons-set-${this.id}`
    for (let idx = 0; idx < options.length; ++idx) {
        const tag = `${this.tag}-nested-${idx}`
        const label = options[idx]
        const value = values ? values[idx] : null

        const el = new JSPG.Entities
                       .LabeledElement(tag, label, this.align)
                       .AsRadio(*isChecked=defaultIdx == idx, value, name)

        this.nestedElements.push(el)
    }

    this.Value = () => {
        for (const nel of this.nestedElements.values()) {
            if (nel.element.checked) return nel.Value()
        }
    }

    this.finalize()
    return this
}

this.AsOptions = function (options, defaultIdx=0, values=null) {
    this.html_tag = JSPG.Constants.HTML.TAGS.SELECT
    for (let idx = 0; idx < options.length; ++idx) {
        const tag = `${this.tag}-nested-${idx}`
        const label = options[idx]
        const value = values ? values[idx] : null
        const isSelected = defaultIdx == idx

        const el = new JSPG.Entities.Element(tag)
                       .AsOption(label, value, isSelected)

        this.nestedElements.push(el)
    }

    this.Value = () => {
        for (const nel of this.nestedElements.values()) {
            if (nel.element.selected) return nel.Value()
        }
    }

    this.finalize()
    return this
}

this.AsList = function (options, ordered=false) {
    this.html_tag = ordered
                    ? JSPG.Constants.HTML.TAGS.ORDERED_LIST
                    : JSPG.Constants.HTML.TAGS.LIST
    for (let idx = 0; idx < options.length; ++idx) {
        const el = new JSPG.Entities.Element()
                       .AsCustom(JSPG.Constants.HTML.TAGS.LIST_ENTRY, true, options[idx])
        this.nestedElements.push(el)
    }
    this.joinWith = ''

    this.finalize()
    return this
}

// Public
this.Get = function () {
    // Compose element and its childs to HTML code
    const content = []
    for (let idx = 0; idx < this.nestedElements.length; ++idx) {
        content.push(this.nestedElements[idx].Get())
    }
    const html = `<${this.html_tag} ${this.attrs.compose()}>${content.join(this.joinWith)}</${this.html_tag}>`

    return html
}

this.Value = function () {
    // Returns value of elements group. Is overwritten in As... functions
    return null
}

this.Enable = function () {
    // Enables element and it's childs
    const element = this.findInDOM()
    if (!element) return

    element.disabled = false
    this.eventHandler.apply(element, this)

    for (let idx = 0; idx < this.nestedElements.length; ++idx) {
        this.nestedElements[idx].Enable()
    }
}

this.Disable = function () {
    // Disables element and it's childs, and removes all attached event listeners
    this.eventHandler.clear(this.element)

    if (!this.element) return

    for (let idx = 0; idx < this.nestedElements.length; ++idx) {
        this.nestedElements[idx].Disable()
    }
    this.element.disabled = true
    this.log.info('{Disable}', `Element group [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
}

this.AddEventHandler = function (eventName, callback, tag, useLimit, disableOnLimit) {
    // Adds event listener directly to element, but not childs
    this.eventHandler.add(...arguments)
}

this.RemoveEventHandler = function (eventName, tag) {
    // Removes event listener directly from element, but not childs
    this.eventHandler.remove(this.element, eventName, tag)
}

this.AddEventHandlerToNested = function (eventName, callback, tag, useLimit, disableOnLimit) {
    // Adds event listener to all childs, but not element itself
    for (let idx = 0; idx < this.nestedElements.length; ++idx) {
        this.nestedElements[idx].AddEventHandler(...arguments)
    }
}

this.RemoveEventHandlerFromNested = function (eventName, tag) {
    // Removes event listener from all childs, but not element itself
    for (let idx = 0; idx < this.nestedElements.length; ++idx) {
        this.nestedElements[idx].RemoveEventHandler(eventName, tag)
    }
}

this.Nested = function (index) {
    // Returns nested element by given tag or index
    if (index > this.nestedElements.size || index < 0) {
        this.log.error('{Nested}', 'Given nested index ${tag} is out of range (${this.nestedElements.size})!')
        return null
    }

    return this.nestedElements[index]
}


// Private
this.findInDOM = function () {
    if (!this.element) {
        const $node = $(`${this.html_tag}[uid=${this.id}]`)
        if ($node.length > 0) this.element = $node[0]
    }

    return this.element
}

this.toString = function () {
    return `[Elements Group <${this.html_tag}>/tag=${this.tag}, id=${this.id}/ of ${this.nestedElements.length} items]`
}

this.finalize = function () {
    delete this['AsRadiobuttons']
    delete this['AsOptions']
    delete this['AsList']
    delete this['finalize']
}
