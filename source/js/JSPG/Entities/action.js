//@wrap:function:JSPG.Entities.Action:

this.id = JSPG.uid()
this.debugName = 'action'
this.name = ""
this.icon = null
this.desc = []
this.exec = null
this.goto = null
this.type = JSPG.Constants.BLOB_TYPES.SCENE_RIGHT
this.portrait = ""
this.tag = ""
this.condition = true
this.log = new Logger(
    JSPG.Logging.ENTITIES.ACTION.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.ACTION.level
)

this.fromConfig = function (actionConfig) {
    this.log.info('{fromConfig}',
        `Generating new action with type ${JSPG.getByNormalizedKey(actionConfig, 'type', this.type)}`)

    // Note:
    // GOTO should be evaluated right before execution, because EXEC code may modify it
    propsCallbacks = {
        [JSPG.Constants.SCHEMAS.ACTION.NAME]: name => {
            if (name.startsWith('`') && name.endsWith('`')) return eval(name)
            return JSPG.parseParamValue(name)
        },
        [JSPG.Constants.SCHEMAS.ACTION.TYPE]:      type => JSPG.parseParamValue(type).toLowerCase(),
        [JSPG.Constants.SCHEMAS.ACTION.DESC]:      desc => Array.isArray(desc) ? desc : [desc],
        [JSPG.Constants.SCHEMAS.ACTION.ICON]:      iconCfg => new JSPG.Entities.Icon(iconCfg).asActionIcon(),
        [JSPG.Constants.SCHEMAS.ACTION.CONDITION]: condition => JSPG.parseParamValue(condition)
    }
    JSPG.normalizeAndCopyToObject(actionConfig, this,
                                  Object.values(JSPG.Constants.SCHEMAS.ACTION),
                                  propsCallbacks)

    if (this.name === '' ) {
        throw new Error("[JSPG|ActionEntity] Name is not defined");
        return false
    }

    if (this.desc.length == 0) {
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
    this.log.debug('{fromConfig}', `   condition: ${this.condition}`)

    return this.condition
}
