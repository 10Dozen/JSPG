//@wrap:function:JSPG.Entities.Scene:id, name

this.id = id
this.debugName = 'scene'
this.name = name
this.desc = []
this.type = JSPG.Constants.BLOB_TYPES.SCENE_CENTER
this.actions = []
this.portrait = ''
this.pre_exec = null
this.post_exec = null
this.goto = null
this.log = new Logger(
    JSPG.Logging.ENTITIES.SCENE.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.SCENE.level
)

this.fromConfig = function (sceneConfig) {
    this.log.info('{fromConfig}',
        `Generating new scene with type ${JSPG.getByNormalizedKey(sceneConfig, "type", this.type)}`)

    // Note:
    // GOTO should be evaluated right before execution, because EXEC code may modify it
    propCallbacks = {
        [JSPG.Constants.SCHEMAS.SCENE.DESC]:     desc => Array.isArray(desc) ? desc : [desc],
        [JSPG.Constants.SCHEMAS.SCENE.ACTIONS]:  actions => this.setActions(actions),
        [JSPG.Constants.SCHEMAS.SCENE.TYPE]:     type => JSPG.parseParamValue(type).toLowerCase()
    }

    JSPG.normalizeAndCopyToObject(sceneConfig, this,
                                  Object.values(JSPG.Constants.SCHEMAS.SCENE),
                                  propCallbacks)

    if (!Object.values(JSPG.Constants.BLOB_TYPES).includes(this.type)) {
        this.log.err('{fromConfig}', `Unknown scene type ${this.type}!`)
    }
}

this.setActions = function (action_list) {
    this.clearActions()
    for (let i = 0; i < action_list.length; ++i) {
        this.addAction(action_list[i])
    }
}

this.addAction = function (action_cfg, idx=this.actions.length) {
    const action = new JSPG.Entities.Action()
    if (action.fromConfig(action_cfg)) {
        this.actions.splice(idx, 0, action)
    }
}

this.getActionByTag = function (tag) {
    const actionIdx = this.actions.findIndex(action => action.tag == tag)
    if (actionIdx < 0) return
    return this.actions[actionIdx]
}

this.clearActions = function () {
    this.actions.purge()
}

this.deleteActionAt = function (idx, size=1) {
    this.actions.splice(idx, size)
}

this.deleteActionByTag = function (tag) {
    const actionIdx = this.actions.findIndex(action => action.tag == tag)
    if (actionIdx < 0) return
    this.deleteActionAt(actionIdx)
}
