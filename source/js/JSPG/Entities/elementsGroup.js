//@wrap:function:JSPG.Entities.ElementsGroup:tag=null, align='left', joinWith='<br>'
//@inline:fake_named_params

this.id = JSPG.uid()
this.tag = tag
this.align = align
this.joinWith = joinWith
this.onValueChange = null
this.value = null

this.type = ''
this.html_tag = ''

this.attrs = new JSPG.Entities.Attributes({uid: this.id, tag: this.tag})
this.eventHandler = new JSPG.Entities.EventHandler()

this.nestedElemetns = new Map()

this.log = new Logger(
    JSPG.Logging.ENTITIES.ELEMENTS_GROUP.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.ELEMENTS_GROUP.level
)

// Constructor functions
this.AsRadiobuttons = function (options, defaultIdx=0, name='', values=null) {
    // Configure element to Radiobutton set
    this.type = 'RadiobuttonSet'
    for (let idx = 0; idx < options.length; ++idx) {
        const tag = `${this.tag}-nested-${idx}`
        const label = options[idx]
        const value = values ? values[idx] : null

        const rb = new JSPG.Entities
                       .LabeledElement(label, tag, this.align)
                       .AsRadio(*isChecked=defaultIdx == idx, value, name)

        this.nestedElements.set(tag, rb)
    }
    this.onValueChange = (event) => {
        if (event.target.checked) {
            this.value = this.nestedElements.get(event.target.getAttribute('tag'))
        }
    }

    this.finalize()
}


// Public
this.Get = function () {
    // Compose element and its childs to HTML code
    const content = []
    for (const nestedItem of this.nestedElements.values()) {
        content.push(nestedItem.Get())
    }
    const html = `<${html_tag} ${this.attrs.compose()}>${content.join(this.joinWith)}</${html_tag}>`

    return html
}

this.Value = function () {
    // Returns value of elements group
    // this.value is updated by this.onValueChange function, depending on type of group

    this.value
}

this.Enable = function () {
    // Enables element and it's childs
    const element = this.findInDOM()
    if (!element) return

    element.disabled = false

    switch (this.type) {
        case "RadiobuttonSet": {
            $(this.element).on('change.inbuilt', '*', this.onValueChange)
            break;
        }
    }
    this.eventHandler.apply(element, this)

    for (const nested in this.nestedElements.values()) {
        nested.Enable()
    }
}

this.Disable = function () {
    // Disables element and it's childs, and removes all attached event listeners
    this.eventHandler.clear(this.element)

    if (!this.element) return

    for (const nested in this.nestedElements.values()) {
        nested.Disable()
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
    for (const nested in this.nestedElements.values()) {
        nested.AddEventHandler(...arguments)
    }
}

this.RemoveEventHandlerFromNested = function (eventName, tag) {
    // Removes event listener from all childs, but not element itself
    for (const nested in this.nestedElements.values()) {
        nested.RemoveEventHandler(eventName, tag)
    }
}

this.Nested = function (tagOrIndex) {
    // Returns nested element by given tag or index
    let tag = tagOrIndex
    if (typeof tag != typeof '') {
        if (this.nestedElements.size() > tag) {
            this.log.error('{Nested}', 'Given nested index ${tag} is out of range (${this.nestedElements.size()})!')
            return
        }

        tag = `${this.tag}-nested-${tag}`
    }
    return this.nestedElements.get(tag)
}


// Private
this.findInDOM = function () {
    if (!this.element) {
        const $node = $(`${html_tag}[uid=${this.id}]`)
        if ($node.length > 0) this.element = $node[0]
    }

    return this.element
}

this.finalize = function () {
    delete this['AsRadiobuttons']
    delete this['finalize']
}



        rb.AsRadio(*isChecked=false, *value=value, *name=name)
