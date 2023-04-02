function log(prefix, msg) {
    console.log(`[JSPG/${prefix}] ${msg}`)
}

const UID_SEQUENCE = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']
function uid() {
    const uid = []
    for (let i = 0; i < 10; ++i) {
        uid.push(UID_SEQUENCE.selectRandom())
    }

    return uid.join('')
}

// === Expansion functions ==
(function($) {
    $.fn.scrollTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);

Array.prototype.selectRandom = function(func, thisArg) {
    return this[Math.floor(Math.random() * this.length)]
}

// === Constants ===
const GAME_TIMEOUTS = {
    ACTION: {
        SHOW_OPTIONS: 500,
        SHOW_ANSWER: 200,
        EXECUTE: 200
    },
    SCENE: {
        SHOW: 200,
        STEP: 300
    },
    GOTO: 50
}

const BLOB_STYLES = {
    SCENE_LEFT: "scene-even",
    SCENE_RIGHT: "scene-odd",
    DIALOG_LEFT: "scene-even portrait portrait-left",
    DIALOG_RIGHT: "scene-odd portrait portrait-right",
    TITLE: "scene-title",
    SUBTITLE: "scene-subtitle"
}

const SCENE_FIELDS = {
    DESC: "desc",
    TYPE: "type",
    ACTIONS: "actions",
    PORTRAIT: "portrait",
    PRE_EXEC: "pre_exec",
    POST_EXEC: "post_exec",
    GOTO: "goto"
}

const SCENE_TYPES = {
    SCENE: "scene",
    TITLE: "title",
    SUBTITLE: "subtitle",
    DIALOG: "dialog",
    DIALOG_RIGHT: "dialog_right"
}

const ACTION_FIELDS = {
    NAME: "name",
    DESC: "desc",
    EXEC: "exec",
    TYPE: "type",
    GOTO: "goto" ,
    PORTRAIT: "portrait",
    TAG: "tag",
    CONDITION: "condition"
}

const ACTION_TYPES = {
    HIDDEN: "hidden",
    SCENE: "scene",
    DIALOG: "dialog"
}

// === Main ===
const ActionHandler = function () {
    this.actions = []
    this.inlineActions = []

    this.getActionById = function (id) {
        return this.actions.find(action => { return action.id === id })
    };

    this.clearActionList = function () {
        this.actions.splice(0, this.actions.length)
        this.inlineActions.splice(0, this.inlineActions.length)
    };

    this.setSceneActions = function (actions) {
        this.clearActionList();

        this.actions = actions
        log('AH.setSceneActions', `Preparing ${actions.length} actions`)

        actions.forEach(action => {
            log('AH.setSceneActions', `Id: ${action.id}, Name: ${action.name}`);
            $(".actions").append( `<div class="action-btn" uid=${action.id}></div>` )

            const $btn = $(`.action-btn[uid=${action.id}]`)
            $btn.html(action.name)
            $btn.css({
                "display": "block",
                "position": "absolute",
                "left": "-200px"
            })
            $btn.off()
            $btn.on("click", () => this.onActionSelected(action.id))
        })

        $(".actions").css("min-height", $(".actions").height() + "px");
    };

    this.onActionSelected = function (actionId) {
        this.hideActionButtons()
        const action = this.getActionById(actionId)

        this.showActionDescription(action)
        this.executeAction(action)
    }

    this.showActionDescription = function (action) {
        if (action.type == ACTION_TYPES.HIDDEN) {
            return
        }

        let answerClass = BLOB_STYLES.SCENE_RIGHT
        if (action.type == ACTION_TYPES.DIALOG) {
            answerClass = BLOB_STYLES.DIALOG_RIGHT
        }

        $("#scenes").append(
            "<div class='scene-description " + answerClass + "'>"
            + action.portrait
            + action.desc
            + "</div>"
        );

        setTimeout(function () {
            $(".scene-odd").css("opacity", 1);
        }, GAME_TIMEOUTS.ACTION.SHOW_ANSWER);
    }

    this.executeAction = function (action) {
        setTimeout(() => {
            // If action exec code return False - GoTo will be ignored (e.g. action code invokes goTo)
            const execResult = Game.execCode(action.exec)
            if (
                (typeof execResult != "undefined" && !execResult)
                || action.goto == ""
            ) {
                log('AH.OnActionExecute', 'Skip action\'s GoTo')
                return
            }

            log('AH.OnActionExecute', `GoTo: ${action.goto}`);
            Game.goTo(action.goto)
        }, GAME_TIMEOUTS.ACTION.EXECUTE);
    }

    this.showActionButtons = function () {
        setTimeout(() => {
            $(".action-btn").css({
                "position": "",
                "left": "0px",
                "opacity": 1
            })

            // Map inline actions to actual html-elements
            this.inlineActions.forEach(action => {
                action.element = $(`span[scene-id=${Game.currentSceneId}] .inline-button[uid=${action.id}]`)
                action.element.on("click", () => this.onInlineActionClicked(action.id) )
            })
        }, GAME_TIMEOUTS.ACTION.SHOW_OPTIONS);
    };

    this.hideActionButtons = function () {
        const actionBtns = ".action-btn"
        $(actionBtns).css("display","none");
        $(actionBtns).css("opacity", 0);
        $(actionBtns).off();
        $(actionBtns).remove();

        $(".action-btn-holder").css("display","block");
        $(".actions").css("min-height", $(".actions").height() + "px");

        this.inlineActions.forEach(action => action.disable())
    };

    this.addInlineAction = function (text, callback, tag='', use_limit=1) {
        const action = new InlineAction(text, callback, tag, use_limit)
        this.inlineActions.push(action)
        log('AH.addInlineAction',
            `Added inline action with id ${action.id} (text: ${action.text}, tag: ${action.tag}, use_limit: ${action.use_limit})`)

        console.log(this.inlineActions)
        return action
    }

    this.getInlineActionById = function(id) {
        return this.inlineActions.find(action => action.id === id)
    }

    this.getInlineActionByTag = function(tag) {
        return this.inlineActions.find(action => action.tag.toLowerCase() === tag.toLowerCase())
    }

    this.onInlineActionClicked = function (id) {
        log('AH.onInlineActionClicked', `Clicked action with id ${id}`)

        const action = this.getInlineActionById(id)
        if (typeof action === "undefined") return
        return action.onClick()
    }
};

const Action = function () {
    this.id = uid()
    this.name = ""
    this.desc = ""
    this.exec = ""
    this.goto = ""
    this.type = ACTION_TYPES.SCENE
    this.portrait = ""
    this.tag = ""
    this.available = true

    this.fromConfig = function (actionConfig) {
        for (const p in actionConfig) {
            switch (p.toLowerCase()) {
                case ACTION_FIELDS.TYPE:
                    this.type = actionConfig[p].toLowerCase()
                    break
                case ACTION_FIELDS.PORTRAIT:
                    this.portrait = "<img src='" + actionConfig[p] + "'/>"
                    break
                case ACTION_FIELDS.CONDITION:
                    this.available = actionConfig[p]()
                    break
                case ACTION_FIELDS.NAME:
                case ACTION_FIELDS.DESC:
                case ACTION_FIELDS.TAG:
                case ACTION_FIELDS.EXEC:
                case ACTION_FIELDS.GOTO:
                    this[p.toLowerCase()] = actionConfig[p]
                    break
            }
        }

        if ( this.name == "" ) {
            throw new Error("[JSPG|Action] Name is not defined");
            return false
        }

        if (this.desc == "") {
            this.desc = this.name
        }

        return this.available
    }
};

const InlineAction = function (text, callback, tag='', use_limit=1) {
    this.id = uid()
    this.text = text
    this.tag = tag
    this.callback = callback
    this.use_limit = use_limit
    this.element = ''

    this.onClick = function() {
        if (use_limit > 0) { --this.use_limit }

        log('InlineAction', `Using action ${this.text}. use_limit now is ${this.use_limit}`)
        this.callback()

        if (this.use_limit == 0) this.disable()
    }

    this.compose = function () {
        return `<button class='inline-button' uid=${this.id} tag=${this.tag}>${this.text}</button>`
    }

    this.disable = function () {
        this.element.off()
        this.element.removeClass('inline-button')
        this.element.addClass('inline-button-disabled')
    }
}

const Scene = function(id) {
    this.id = id
    this.desc = []
    this.style = BLOB_STYLES.SCENE_LEFT
    this.actions = []
    this.type = SCENE_TYPES.SCENE
    this.portrait = ''
    this.pre_exec = ''
    this.post_exec = ''
    this.goto = ''

    this.fromConfig = function (sceneConfig) {
        log('Scene', `Generating new scene with type ${sceneConfig.type ?? SCENE_TYPES.SCENE}`)
        for (const p in sceneConfig) {
            switch (p.toLowerCase()) {
                case SCENE_FIELDS.DESC:
                    let desc = sceneConfig[p]
                    if (desc.constructor !== Array) {
                         desc = [desc]
                    }


                    this.desc = desc
                    break
                case SCENE_FIELDS.ACTIONS:
                    this.setActions(sceneConfig[p])
                    break
                case SCENE_FIELDS.TYPE:
                    this.type = sceneConfig[p].toLowerCase()
                    let style = BLOB_STYLES.SCENE_LEFT
                    switch (this.type) {
                        case SCENE_TYPES.TITLE:
                            style = BLOB_STYLES.TITLE
                            break
                        case SCENE_TYPES.SUBTITLE:
                            style = BLOB_STYLES.SUBTITLE
                            break
                        case SCENE_TYPES.DIALOG:
                            style = BLOB_STYLES.DIALOG_LEFT
                            break
                        case SCENE_TYPES.DIALOG_RIGHT:
                            style = BLOB_STYLES.DIALOG_RIGHT
                            break
                    }
                    this.style = style
                    break
                case SCENE_FIELDS.PORTRAIT:
                case SCENE_FIELDS.PRE_EXEC:
                case SCENE_FIELDS.POST_EXEC:
                case SCENE_FIELDS.GOTO:
                    this[p.toLowerCase()] = sceneConfig[p]
                    break
            }
        }
    }

    this.compileDescLines = function () {
        preparedLines = []
        this.desc.forEach(line => {
            if (line.startsWith("`") && line.endsWith("`")) {
                line = eval(line)
            }

            if (line !== "") preparedLines.push(line)
        })

        this.desc = preparedLines
    }

    this.setActions = function (action_list) {
        this.clearActions()
        action_list.forEach(action_cfg => this.addAction(action_cfg))
    }

    this.addAction = function (action_cfg) {
        this.insertAction(action_cfg, this.actions.length)
    }

    this.insertAction = function (action_cfg, idx) {
        const action = new Action()
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
        this.actions.splice(0, this.actions.length)
    }

    this.deleteActionAt = function (idx, size=1) {
        this.actions.splice(idx, size)
    }

    this.deleteActionByTag = function (tag) {
        const actionIdx = this.actions.findIndex(action => action.tag == tag)
        if (actionIdx < 0) return
        this.deleteActionAt(actionIdx)
    }
}

const Game = new (function () {
    this.currentSceneId = -1
    this.currentScene = {}
    this.AH = new ActionHandler();

    this.goTo = function (SceneName) {
        setTimeout(()=>{
            this.showScene(Scenes[SceneName])
        }, GAME_TIMEOUTS.GOTO)
    };

    this.composeBlob = function (frame) {
        const scene = this.currentScene

        // Run interpretation on desired description lines
        let desc = scene.desc[frame]

        // Set portrait img node
        let $portrait = scene.portrait;
        if (scene.type == SCENE_TYPES.DIALOG && $portrait != "") {
            $portrait = `<img src="${$portrait}"/>`;
        }

        // Compose blob
        return `<div class="scene-description ${scene.style}" frame=${frame}>${$portrait}${desc}</div>`
    }

    this.showScene = function (SceneToShow)  {
        const sceneId = ++this.currentSceneId;
        log('ShowScene', `---------- Rendering new scene with id ${sceneId} ----------`)
        // Drop actions before any next step
        this.AH.hideActionButtons();

        // Copy scene object to safely apply pre-exec code:
        const scene = new Scene(sceneId)
        scene.fromConfig(SceneToShow)
        this.currentScene = scene

        // Run scene's Pre-Exec
        // This may change some scene's data, so data should be read after
        // If pre_exec code returns False - scene rendering will be canceled
        // use this if pre_exec triggers goTo
        const preExecResult = this.execPreScene();
        if (typeof preExecResult != "undefined") {
            if (!preExecResult) {
                log('ShowScene', `[id:${sceneId}] Stop scene rendering as Pre-exec resulted in False`)
                return
            }
        }

        // Prepare Actions
        this.AH.setSceneActions(scene.actions);

        // Skip blob rendering if there is none
        scene.compileDescLines()
        const framesAmount = scene.desc.length
        if (framesAmount == 0) {
            log('ShowScene', `[id:${sceneId}] There is no description blobs. Stop rendering.`)

            log('ShowScene', `[id:${sceneId}] Rendering actions`)
            this.AH.showActionButtons()

            log('ShowScene', `[id:${sceneId}] Executing post scene`)
            this.execPostScene()

            return
        }

        // Rendering description blobs
        $("#scenes").append(`<span scene-id=${sceneId}></span>`)
        for (let frame = 0; frame < framesAmount; ++frame) {
            const $blob = this.composeBlob(frame)
            $(`span[scene-id=${sceneId}]`).append($blob)

            setTimeout(() => {
                log('ShowScene.On Blob Render Timeout', `Rendering scene ${sceneId}, frame ${frame}`)
                const element = `span[scene-id=${sceneId}] .scene-description[frame=${frame}]`
                $(element).css("opacity", 1)
                $(element).scrollTo()
            }, GAME_TIMEOUTS.SCENE.SHOW + (GAME_TIMEOUTS.SCENE.STEP * frame))
        }

        // Set up scene finalizer timer
        const timeout = GAME_TIMEOUTS.SCENE.SHOW + (GAME_TIMEOUTS.SCENE.STEP * framesAmount)
        log('ShowScene', `[id:${sceneId}] Setting timeout to end rendering in ${timeout} s.`)
        setTimeout(() => {
            log('ShowScene', `[id:${sceneId}] Blobs drawn. Rendering actions`)
            this.AH.showActionButtons()

            log('ShowScene', `[id:${sceneId}] Blobs drawn. Executing post scene`)
            this.execPostScene()
        }, timeout)
    };

    this.execPreScene = function () {
        log('PreScene', `[id:${this.currentSceneId}] Executing pre-scene code`)
        return this.execCode(this.currentScene.pre_exec)
    };

    this.execPostScene = function () {
        log('PostScene', `[id:${this.currentSceneId}] Executing post-scene code`)
        this.execCode(this.currentScene.post_exec)

        const goToScene = this.currentScene.goto
        if (goToScene == "") { return }

        log('PostScene', `[id:${this.currentSceneId}] GoTo navigation to ${goToScene}`);
        this.goTo(goToScene)
    };

    this.execCode = function (code) {
        let result
        if (typeof(code) == typeof("")) {
            if (code != "") {
                result = eval(code)
            }
        } else {
            result = code()
        }

        return result
    }

})();

const Helper = new (function() {
    this.Click = function(text, callback, tag='', use_limit=1) {
        const inline_action = Game.AH.addInlineAction(text, callback, tag, use_limit)
        return inline_action.compose()
    }
    this.Img = function(uri, tag='', attrs={}) {
        const element = new Img(uri, tag, attrs)
        return element.compose()
    }
    this.Label = function(text, tag='', attrs={}) {
        const element = new Label(text, tag, attrs)
        return element.compose()
    }

    this.Find = {
        ByTag: function(tag) {
            return $(`*[tag=${tag}]`)[0]
        }
    }

    this.desc = {
        set: function(lines) {
            Game.currentScene.desc = lines
        },

        add: function(line) {
            Game.currentScene.desc.push(line)
        },

        addFirst: function(line) {
            Game.currentScene.desc.unshift(line)
        },

        putAt: function (line, idx) {
            Game.currentScene.desc.splice(idx, 0, line)
        },

        clear: function(line) {
            Game.currentScene.desc = []
        },

        deleteAt: function(idx, size=1) {
            Game.currentScene.desc.splice(idx, size)
        }
    }

    this.actions = {
        set: function(action_list) {
            Game.currentScene.setActions(action_list)
        },

        add: function(action_cfg) {
            Game.currentScene.addAction(action_cfg)
        },

        addFirst: function(action_cfg) {
            Game.currentScene.insertAction(action_cfg, 0)
        },

        putAt: function (action_cfg, idx) {
            Game.currentScene.insertAction(action_cfg, idx)
        },

        getByTag: function (tag) {
            return Game.currentScene.getActionByTag(tag)
        },

        clear: function(line) {
            Game.currentScene.clearActions()
        },

        deleteAt: function(idx, size=1) {
            Game.currentScene.deleteActionAt(idx, size)
        },

        deleteByTag: function (tag) {
            Game.currentScene.deleteActionByTag(tag)
        }
    }
})()

// ----- Elements ----
const Img = function (uri, tag='', attrs={}) {
    this.id = uid()
    this.tag = tag
    this.uri = uri
    this.attrs = attrs

    this.compose = function() {
        const attrs = []
        Object.keys(this.attrs).forEach(k => attrs.push(`${k}='${this.attrs[k]}'`))
        const attrLine = attrs.join(' ')

        return `<img uid='${this.id}' tag='${this.tag}' src='${this.uri}' ${attrLine} />`
    }
}

const Label = function (text, tag='', attrs={}) {
    this.id = uid()
    this.tag = tag
    this.text = text
    this.attrs = attrs

    this.compose = function() {
        const attrs = []
        Object.keys(this.attrs).forEach(k => attrs.push(`${k}='${this.attrs[k]}'`))
        const attrLine = attrs.join(' ')

        return `<label uid='${this.id}' tag='${this.tag}' ${attrLine}>${this.text}</label>`
    }
}


$( document ).ready(function() {
    Game.showScene(Scenes.Init);
});
