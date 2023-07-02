//@wrap:closure:JSPG.SceneHandler:

this.currentSceneId = -1
this.currentScene = {}
this.SELECTORS = {
    CONTAINER: '#scenes',
    SCENE: 'span[scene-id={scene_id}]',
    BLOB: 'span[scene-id={scene_id}] .scene-description[uid={uid}]'
}
this.HTML = {
    SCENE: '<span scene-id={scene_id}></span>',
}
this.log = new Logger(
    JSPG.Logging.SCENE_HANDLER.id,
    JSPG.Logging.SCENE_HANDLER.level
)

this.goTo = function (sceneName) {
    if (!sceneName) {
        this.log.err('{goTo}', 'Transition to invalid (empty) scene name is requested!')
        return
    }
    if (!JSPG.Scenes.hasOwnProperty(sceneName)) {
        this.log.err('{goTo}', `Transition to non-existsing scene (name: ${sceneName}) is requested!`)
        return
    }

    setTimeout(()=>{
        this.showScene(sceneName, JSPG.Scenes[sceneName])
    }, JSPG.Constants.TIMEOUTS.GOTO)
};

this.drawBlob = function (blob, drawTimeout=0, scrollTo=false) {
    const sceneId = this.currentSceneId
    $(this.SELECTORS.SCENE.format('scene_id', sceneId)).append(blob.html)

    setTimeout(() => {
        this.log.info('{drawBlob.onTimeout}', `Rendering blob ${blob.id} of scene ${sceneId}`)

        const $element = $(this.SELECTORS.BLOB.format({
            scene_id: sceneId,
            uid: blob.id
        }))
        $element.css("opacity", 1)
        if (scrollTo) JSPG.scrollTo(blob.id)
    }, drawTimeout)
}

this.showScene = function (name, sceneConfig)  {
    const sceneId = ++this.currentSceneId;
    this.log.info('{showScene}', `---------- Rendering new scene with id ${sceneId}: ${name} ----------`)
    // Drop actions before any next step
    JSPG.ActionHandler.hideSceneActions();
    JSPG.ElementsHandler.clearElementsList();

    // Copy scene object to safely apply pre-exec code:
    const scene = new JSPG.Entities.Scene(sceneId, name)
    scene.fromConfig(sceneConfig)
    this.currentScene = scene

    // Run scene's Pre-Exec
    // This may change some scene's data, so data should be read after
    // If pre_exec code returns False - scene rendering will be canceled
    // use this if pre_exec triggers goTo
    const preExecResult = this.execPreScene();
    if (preExecResult != undefined && !preExecResult) {
        this.log.debug('{showScene}', `[id:${sceneId}] Stop scene rendering as Pre-exec resulted in False`)
        return
    }

    // Skip blob rendering if there is none
    // scene.compileDescLines()
    const contentfullBlobs = JSPG.BlobBuilder.createBlobsFrom(scene)   //scene.parseDescriptions()
    const framesAmount = contentfullBlobs.length
    if (framesAmount == 0) {
        this.log.debug('{showScene}', `[id:${sceneId}] There is no description blobs. Stop rendering.`)

        this.log.debug('{showScene}', `[id:${sceneId}] Rendering actions`)
        JSPG.ActionHandler.showSceneActions(scene.actions)

        this.log.debug('{showScene}', `[id:${sceneId}] Executing post scene`)
        this.execPostScene()

        return
    }

    // Rendering description blobs
    const baseTimeout = JSPG.Constants.TIMEOUTS.SCENE.SHOW
    $(this.SELECTORS.CONTAINER).append(this.HTML.SCENE.format('scene_id', sceneId))
    for (let frame = 0; frame < framesAmount; ++frame) {
        const frameTimeout = JSPG.Constants.TIMEOUTS.SCENE.STEP * frame
        this.drawBlob(contentfullBlobs[frame], baseTimeout + frameTimeout, frame == 0)
    }

    // Set up scene finalizer timer
    const timeout = JSPG.Constants.TIMEOUTS.SCENE.SHOW + (JSPG.Constants.TIMEOUTS.SCENE.STEP * framesAmount)
    this.log.info('{showScene}', `[id:${sceneId}] Setting timeout to end rendering in ${timeout} s.`)
    setTimeout(() => {
        this.log.debug('{showScene.onRenderTimeout}', `[id:${sceneId}] Blobs drawn. Rendering actions`)
        JSPG.ActionHandler.showSceneActions(scene.actions);

        this.log.debug('{showScene.onRenderTimeout}', `[id:${sceneId}]              Executing post scene`)
        this.execPostScene()

        this.log.debug('{showScene.onRenderTimeout}', `[id:${sceneId}]              Enabling elements`)
        JSPG.ElementsHandler.enableElements()
    }, timeout)
};

this.execPreScene = function () {
    if (this.currentScene.pre_exec == null) return
    this.log.debug('{PreScene}', `[id:${this.currentSceneId}] Executing pre-scene code`)

    const execResult = JSPG.execCode(this.currentScene.pre_exec)
    JSPG.normalizeAndCopyToObject(this.currentScene, null,
        Object.values(JSPG.Constants.SCHEMAS.SCENE))

    return execResult
};

this.execPostScene = function () {
    if (this.currentScene.post_exec == null && this.currentScene.goto === '') return

    if (this.currentScene.post_exec != null) {
        this.log.debug('{PostScene}', `[id:${this.currentSceneId}] Executing post-scene code`)
        JSPG.execCode(this.currentScene.post_exec)
    }

    if (this.currentScene.goto == null) return
    this.log.debug('{PostScene}', `[id:${this.currentSceneId}] GoTo navigation to ${this.currentScene.goto}`);
    this.goTo(JSPG.parseParamValue(this.currentScene.goto))
}

this.showSystemMessage = function (msg) {
    const uid = `sys-${JSPG.uid()}`
    const html = `<div uid="${uid}" class="scene-description ${JSPG.Constants.BLOB_STYLES.SUBTITLE}">${msg}</div>`
    $(this.SELECTORS.CONTAINER).append(html)
    $(`div[uid=${uid}]`).css("opacity", 1)
}

this.clearOutput = function (sys_msg='') {
    this.log.debug('{clearOutput}', 'All output will be wiped out...')
    $(this.SELECTORS.CONTAINER).html('')
    JSPG.ActionHandler.hideSceneActions()
    JSPG.ElementsHandler.clearElementsList()
    if (sys_msg === '') return

    this.showSystemMessage(sys_msg)
}
