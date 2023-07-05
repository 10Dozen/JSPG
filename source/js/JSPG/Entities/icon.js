//@wrap:function:JSPG.Entities.Icon:iconCfg

this.text = null
this.img = null
this.class = null
this.style = null
this.attrs = null
this.iClass = ''
/* this.log = new Logger(
    JSPG.Logging.ENTITIES.ICON.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.ICON.level
)*/

this.fromConfig = function (iconCfg) {
    if (iconCfg == null) return
    JSPG.normalizeAndCopyToObject(iconCfg, this,
                                  Object.values(JSPG.Constants.SCHEMAS.ICON))
    this.attrs = new JSPG.Entities.Attributes(this.attrs)
    this.attrs.modify('class', this.class, JSPG.Constants.OPERATIONS.APPEND)
    this.attrs.modify('style', this.style, JSPG.Constants.OPERATIONS.APPEND)
    return this
}

this.asMenuItemIcon = function () {
    this.iClass = JSPG.Constants.HTML.MENU.ICON_CLS
    return this
}

this.asActionIcon = function () {
    this.iClass = JSPG.Constants.HTML.ACTION.ICON_CLS
    return this
}

this.get = function() {
    const text = this.text == null ? '' : this.text

    // Text or class based icon (e.g. font-awesome)
    if (this.img == null) {
        this.attrs.modify('class', this.iClass, JSPG.Constants.OPERATIONS.APPEND)
        return `<i ${this.attrs.compose()}>${text}</i>`
    }

    // Image based icon
    this.attrs.modify({
        src: this.img,
        alt: text
    })
    return `<i class="${this.iClass}"><img ${this.attrs.compose()}/></i>`
}

// On create:
{
    this.fromConfig(iconCfg)
}
