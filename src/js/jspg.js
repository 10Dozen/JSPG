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
    CONDITION: "condition"
}

const ACTION_TYPES = {
    HIDDEN: "hidden",
    SCENE: "scene",
    DIALOG: "dialog"
}


// === Main ===
var ActionHandler = function () {
    this.actions = [];
    this.actionsId = 0;

    this.getActionById = function (id) {
        return this.actions.find(action => { return action.id === id })
    };

    this.clearActionList = function () {
        this.actions.splice(0, this.actions.length)
        this.actionsId = 0;
    };

    this.checkActionCondition = function (actionConfig) {
        for (const p in actionConfig) {
            if (p.toLowerCase() == ACTION_FIELDS.CONDITION) {
                return actionConfig[p]()
            }
        }
        return true
    }

    this.addAction = function (actionConfig) {
        const action = new Action(this.actionsId)
        action.fromConfig(actionConfig)

        this.actions.push(action)
        ++this.actionsId

        return action;
    };

    this.setSceneActions = function () {
        this.clearActionList();

        const actionConfigs = Game.currentSceneData.actions;
        console.log(`[AH.setSceneActions] There are ${actionConfigs.length} actions`)

        actionConfigs.forEach(cfg => {
            if (!this.checkActionCondition(cfg)) {
                console.log('[AH.setSceneActions] Action is not avaialble (condition failed)')
                return
            }

            const action = this.addAction(cfg)
            console.log(`[AH.setSceneActions] Id: ${action.id}, Name: ${action.name}`);

            $(".actions").append( `<div class="action-btn btn-${action.id}"></div>` )

            const btn = `.btn-${action.id}`
            $(btn).html(action.name)
            $(btn).attr("actionid", action.id)
            $(btn).css({
                "display": "block",
                "position": "absolute",
                "left": "-200px"
            })
            $(btn).off()
            $(btn).on("click", () => {
                this.onActionSelected(action.id)
            })
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
        console.log('(OnActionExecute) GoTo: ' + action.goToScene)
        setTimeout(() => {
            // If action exec code return False - GoTo will be ignored (e.g. action code invokes goTo)
            const execResult = Game.execCode(action.exec)
            if (
                (typeof execResult != "undefined" && !execResult)
                || action.goToScene == ""
            ) {
                console.log('[AH.executeAction] Skip action\'s GoTo')
                return
            }

            Game.goTo(action.goToScene)
        }, GAME_TIMEOUTS.ACTION.EXECUTE);
    }

    this.showActionButtons = function () {
        setTimeout(() => {
            $(".action-btn").css({
                "position": "",
                "left": "0px",
                "opacity": 1
            });
        }, GAME_TIMEOUTS.ACTION.SHOW_OPTIONS);
    };
    this.hideActionButtons = function () {
        $(".actions").css("min-height", $(".actions").height() + "px");

        $(".action-btn").css("display","none");
        $(".action-btn-holder").css("display","block");
        $(".action-btn").css("opacity", 0);

        $(".action-btn").off();
        $(".action-btn").remove();
    };
};

var Action = function (id) {
    this.id = id;
    this.name = "";
    this.desc = "";
    this.exec = "";
    this.goToScene = "";
    this.type = ACTION_TYPES.SCENE;
    this.portrait = "";

    this.fromConfig = function (actionConfig) {
        console.log('|Action.fromConfig|')
        console.log(actionConfig)
        for (const p in actionConfig) {
            switch (p.toLowerCase()) {
                case ACTION_FIELDS.NAME:
                    this.name = actionConfig[p]
                    break;
                case ACTION_FIELDS.DESC:
                    this.desc = actionConfig[p]
                    break
                case ACTION_FIELDS.EXEC:
                    this.exec = actionConfig[p]
                    break
                case ACTION_FIELDS.TYPE:
                    this.type = actionConfig[p].toLowerCase()
                    break
                case ACTION_FIELDS.GOTO:
                    this.goToScene = actionConfig[p]
                    break
                case ACTION_FIELDS.PORTRAIT:
                    this.portrait = "<img src='" + actionConfig[p] + "'/>"
                    break
            }
        }

        if ( this.name == "" ) {
            throw new Error("|Action| Name is not defined");
            return;
        }

        if (this.desc == "") {
            this.desc = this.name
        }
    }
};

var GamePrototype = function () {
    this.currentSceneId = -1

    this.currentScene = {}
    this.currentSceneData = {
        type: "",
        style: "",
        desc: [],
        actions: []
    }

    this.goTo = function (SceneName) {
        setTimeout(()=>{
            this.showScene(Scenes[SceneName])
        }, GAME_TIMEOUTS.GOTO)
    };

    this.getSceneProperty = function (propertyName, _default) {
        for (const k in this.currentScene) {
            if (k.toLowerCase() == propertyName) {
                return this.currentScene[k]
            }
        }

        return _default;
    }

    this.readCurrentSceneData = function () {
        let desc = this.getSceneProperty(SCENE_FIELDS.DESC, []);
        if (desc.constructor !== Array) {
            desc = [desc];
        }

        // Filter empty lines
        desc = desc.filter(el => { return el !== "" })

        let type = this.getSceneProperty(SCENE_FIELDS.TYPE, SCENE_TYPES.SCENE).toLowerCase()

        let style = BLOB_STYLES.SCENE_LEFT
        switch (type) {
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

        const actions = this.getSceneProperty(SCENE_FIELDS.ACTIONS, [])

        const portrait = this.getSceneProperty(SCENE_FIELDS.PORTRAIT, "")

        this.currentSceneData.type = type
        this.currentSceneData.style = style
        this.currentSceneData.desc = desc
        this.currentSceneData.actions = actions
        this.currentSceneData.portrait = portrait

        return this.currentSceneData
    }

    this.composeBlob = function (id, frame, sceneData) {
        let desc = sceneData.desc[frame]
        if (desc == "") {
            return ""
        }

        // Run interpretation on desired description lines
        if (desc.startsWith("`") && desc.endsWith("`")) {
            desc = eval(desc)
        }

        // Set portrait img node
        let $portrait = sceneData.portrait;
        if (sceneData.type == SCENE_TYPES.DIALOG && $portrait != "") {
            $portrait = `<img src="${$portrait}"/>`;
        }

        // Compose blob
        return `<div class="scene-description ${sceneData.style}" sceneId="${id}" sceneFrame="${frame}">${$portrait}${desc}</div>`
    }

    this.showScene = function (SceneToShow)  {
        // Drop actions before any next step
        this.AH.hideActionButtons();

        // Copy scene object to safely apply pre-exec code:
        this.currentScene = Object.assign({}, SceneToShow);
        const sceneId = ++this.currentSceneId;
        console.log(`(ShowScene) Rendering new scene with id ${sceneId}`)

        // Run scene's Pre-Exec
        // This may change some scene's data, so data should be read after
        // If pre_exec code returns False - scene rendering will be canceled
        // use this if pre_exec triggers goTo
        const preExecResult = this.execPreScene();
        if (typeof preExecResult != "undefined") {
            if (!preExecResult) {
                console.log(`(ShowScene)[id:${sceneId}] Stop scene rendering as Pre-exec resulted in False`)
                return
            }
        }

        // Reads data to draw in scene
        const scene = this.readCurrentSceneData()

        // Skip blob rendering if there is none
        const framesAmount = scene.desc.length
        if (framesAmount == 0) {
            console.log(`(ShowScene)[id:${sceneId}] There is no description blobs. Stop rendering.`)

            console.log(`(ShowScene)[id:${sceneId}] Rendering actions`)
            this.AH.showActionButtons()

            console.log(`(ShowScene)[id:${sceneId}] Executing post scene`)
            this.execPostScene()

            return
        }

        // Prepare Actions
        this.AH.setSceneActions();

        // Rendering description blobs
        for (let frame = 0; frame < framesAmount; ++frame) {
            const $blob = this.composeBlob(sceneId, frame, scene)
            $("#scenes").append($blob)

            setTimeout(() => {
                console.log(`(ShowScene) On Blob Render Timeout. Rendering scene ${sceneId}, frame ${frame}`)
                const element = `.scene-description[sceneId=${sceneId}][sceneFrame=${frame}]`
                $(element).css("opacity", 1)
                $(element).scrollTo()
            }, GAME_TIMEOUTS.SCENE.SHOW + (GAME_TIMEOUTS.SCENE.STEP * frame))
        }

        // Set up scene finalizer timer
        const timeout = GAME_TIMEOUTS.SCENE.SHOW + (GAME_TIMEOUTS.SCENE.STEP * framesAmount)
        console.log(`(ShowScene)[id:${sceneId}] Setting timeout to end rendering in ${timeout} s.`)
        setTimeout(() => {
            console.log(`(ShowScene)[id:${sceneId}] Blobs drawn. Rendering actions`)
            this.AH.showActionButtons()

            console.log(`(ShowScene)[id:${sceneId}] Blobs drawn. Executing post scene`)
            this.execPostScene()
        }, timeout)
    };

    this.execPreScene = function () {
        console.log(`(Pre Scene)[id:${Game.currentSceneId}]`);
        const exec = this.getSceneProperty(SCENE_FIELDS.PRE_EXEC, "")
        return this.execCode(exec)
    };

    this.execPostScene = function () {
        console.log(`(Post Scene)[id:${Game.currentSceneId}]`);
        let exec = this.getSceneProperty(SCENE_FIELDS.POST_EXEC, "")
        this.execCode(exec)

        let goToScene = this.getSceneProperty(SCENE_FIELDS.GOTO, "")
        if (goToScene == "") { return }

        console.log(`(Post Scene:)[id:${Game.currentSceneId}] GoTo navigation to ${goToScene}`);
        this.goTo(goToScene)
    };

    this.execCode = function (code) {
        return (typeof(code) == typeof("")) ? eval(code) : code()
    }

    this.AH = new ActionHandler();
    this.AH.hideActionButtons();
};

var Helper = new (function() {
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
            Game.currentScene.actions = action_list
        },

        add: function(action_cfg) {
            Game.currentScene.actions.push(action_cfg)
        },

        addFirst: function(action_cfg) {
            Game.currentScene.actions.unshift(action_cfg)
        },

        putAt: function (action_cfg, idx) {
            Game.currentScene.actions.splice(idx, 0, action_cfg)
        },

        clear: function(line) {
            Game.currentScene.actions = []
        },

        deleteAt: function(idx, size=1) {
            Game.currentScene.actions.splice(idx, size)
        }
    }
})()

$( document ).ready(function() {
    Game = new GamePrototype();

    Game.showScene(Scenes.Init);
});
