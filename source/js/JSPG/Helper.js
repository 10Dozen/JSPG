//@wrap:closure:JSPG.Helper:
this.Click = function(text, callback, tag='', use_limit=1, style=null, attrs=null) {
    const element = new JSPG.Entities.Element(tag).AsClick(text)
    element.attrs.modify('class', "inline-button")
    element.attrs.modify('style', style)
    element.attrs.modify('attrs', attrs, JSPG.Constants.OPERATIONS.APPEND)
    element.AddEventHandler("click", callback, null, use_limit, true)

    JSPG.ElementsHandler.RegisterElement(element)

    return element.Get()
}
this.Img = function(src, tag='', style=null, attrs=null) {
    const element = new JSPG.Entities.Element(tag).AsImage(src)
    element.attrs.modify('style', style)
    element.attrs.modify('attrs', attrs, JSPG.Constants.OPERATIONS.APPEND)
    JSPG.ElementsHandler.RegisterElement(element)
    return element.Get()
}
this.Video = function(src, autoplay=true, loop=true, muted=false, tag='', style=null, attrs=null) {
    const element = new JSPG.Entities.Element(tag).AsVideo(src, autoplay, loop, muted)
    element.attrs.modify('style', style)
    element.attrs.modify('attrs', attrs, JSPG.Constants.OPERATIONS.APPEND)
    JSPG.ElementsHandler.RegisterElement(element)
    return element.Get()
}
this.Label = function(text, tag='', style=null, attrs=null) {
    const element = new JSPG.Entities.Element(tag).AsLabel(text)
    element.attrs.modify('style', style)
    element.attrs.modify('attrs', attrs, JSPG.Constants.OPERATIONS.APPEND)
    JSPG.ElementsHandler.RegisterElement(element)
    return element.Get()
}
this.Input = function(defaultValue, tag='', placeholder=null, style=null, attrs=null) {
    const element = new JSPG.Entities.Element(tag).AsInput(defaultValue, placeholder)
    element.attrs.modify('style', style)
    element.attrs.modify('attrs', attrs, JSPG.Constants.OPERATIONS.APPEND)
    JSPG.ElementsHandler.RegisterElement(element)
    return element.Get()
}

this.Checkbox = function (label, isChecked=false, align='left', tag='', style=null, attrs=null) {
    const element = new JSPG.Entities.LabeledElement(label, tag, align)
                                     .AsCheckbox(isChecked)
    element.attrs.modify('style', style)
    element.attrs.modify('attrs', attrs, JSPG.Constants.OPERATIONS.APPEND)
    JSPG.ElementsHandler.RegisterElement(element)

    return element.Get()
}



this.Find = {
    ByTag: function(tag) {
        return JSPG.ElementsHandler.FindByTag(tag)
    }
}

this.Desc = {
    Set: function(lines) {
        JSPG.GetCurrentScene().desc = lines
    },

    Add: function(line) {
        JSPG.GetCurrentScene().desc.push(line)
    },

    AddFirst: function(line) {
        JSPG.GetCurrentScene().desc.unshift(line)
    },

    PutAt: function (line, idx) {
        JSPG.GetCurrentScene().desc.splice(idx, 0, line)
    },

    Clear: function(line) {
        JSPG.GetCurrentScene().desc = []
    },

    DeleteAt: function(idx, size=1) {
        JSPG.GetCurrentScene().desc.splice(idx, size)
    }
}

this.Actions = {
    Set: function(action_list) {
        JSPG.GetCurrentScene().setActions(action_list)
    },

    Add: function(action_cfg) {
        JSPG.GetCurrentScene().addAction(action_cfg)
    },

    AddFirst: function(action_cfg) {
        JSPG.GetCurrentScene().addAction(action_cfg, 0)
    },

    PutAt: function (action_cfg, idx) {
        JSPG.GetCurrentScene().addAction(action_cfg, idx)
    },

    GetByTag: function (tag) {
        return JSPG.GetCurrentScene().getActionByTag(tag)
    },

    Clear: function(line) {
        JSPG.GetCurrentScene().clearActions()
    },

    DeleteAt: function(idx, size=1) {
        JSPG.GetCurrentScene().deleteActionAt(idx, size)
    },

    DeleteByTag: function (tag) {
        JSPG.GetCurrentScene().deleteActionByTag(tag)
    }
}
