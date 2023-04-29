//@wrap:function:JSPG.Entities.Action:

this.id = JSPG.uid()
this.name = ""
this.icon = null
this.desc = ""
this.exec = ""
this.goto = ""
this.type = JSPG.Constants.BLOB_TYPES.SCENE_RIGHT
this.portrait = ""
this.tag = ""
this.available = true
this.log = new Logger(
    JSPG.Logging.ENTITIES.ACTION.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.ACTION.level
)

this.fromConfig = function (actionConfig) {
    this.log.info('{fromConfig}',
        `Generating new action with type ${JSPG.getByNormalizedKey(actionConfig, 'type', this.type)}`)

    propsCallbacks = {}
    propsCallbacks[JSPG.Constants.SCHEMAS.ACTION.NAME] = name => {
        if (name.startsWith('`') && name.endsWith('`')) return eval(name)
        return name
    }
    propsCallbacks[JSPG.Constants.SCHEMAS.ACTION.TYPE] = type => type.toLowerCase()
    propsCallbacks[JSPG.Constants.SCHEMAS.ACTION.PORTRAIT] = img => `<img src='${img}'/>`
    propsCallbacks[JSPG.Constants.SCHEMAS.ACTION.DESC] = desc => Array.isArray(desc) ? desc : [desc]
    propsCallbacks[JSPG.Constants.SCHEMAS.ACTION.ICON] = iconCfg => new JSPG.Entities.Icon(iconCfg).asActionIcon()
    propsCallbacks[JSPG.Constants.SCHEMAS.ACTION.CONDITION] = condition => condition()
    JSPG.normalizeAndCopyToObject(actionConfig, this,
                                  Object.values(JSPG.Constants.SCHEMAS.ACTION),
                                  propsCallbacks)

    if (this.name === '' ) {
        throw new Error("[JSPG|ActionEntity] Name is not defined");
        return false
    }

    if (this.desc === '') {
        this.desc = [this.name]
    }

    if (!Object.values(JSPG.Constants.BLOB_TYPES).includes(this.type)) {
        this.log.err('{fromConfig}', `Unknown type ${this.type} of action blob!`)
    }

    this.log.debug('{fromConfig}', 'Action entity:')
    this.log.debug('{fromConfig}', `   uid:       ${this.id}`)
    this.log.debug('{fromConfig}', `   tag:       ${this.tag}`)
    this.log.debug('{fromConfig}', `   name:      ${this.name}`)
    this.log.debug('{fromConfig}', `   desc:      ${this.desc}`)
    this.log.debug('{fromConfig}', `   icon:      ${this.icon}`)
    this.log.debug('{fromConfig}', `   portrait:  ${this.portrait}`)
    this.log.debug('{fromConfig}', `   type:      ${this.type}`)
    this.log.debug('{fromConfig}', `   goto:      ${this.goto}`)
    this.log.debug('{fromConfig}', `   condition: ${this.available}`)

    return this.available
}

this.parseDescriptions = function () {
    const contentfullBlobs = []
    for (let i = 0; i < this.desc.length; ++i) {
        const blob = new JSPG.Entities.Blob(this.type, this.portrait, this.desc[i])
        if (blob.content === '') return
        contentfullBlobs.push(blob)
    }

    return contentfullBlobs
}
