function log(prefix, msg) {
    console.log(`[JSPG/${prefix}] ${msg}`)
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



const JSPG = {
    Scenes: []
}
JSPG['Constants'] = {
    UID_SEQ: ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'],
    TIMEOUTS: {
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
    },
    BLOB_STYLES: {
        SCENE_LEFT: "scene-even",
        SCENE_RIGHT: "scene-odd",
        DIALOG_LEFT: "scene-even portrait portrait-left",
        DIALOG_RIGHT: "scene-odd portrait portrait-right",
        TITLE: "scene-title",
        SUBTITLE: "scene-subtitle"
    },
    SCENE_FIELDS: {
        DESC: "desc",
        TYPE: "type",
        ACTIONS: "actions",
        PORTRAIT: "portrait",
        PRE_EXEC: "pre_exec",
        POST_EXEC: "post_exec",
        GOTO: "goto"
    },
    SCENE_TYPES: {
        SCENE: "scene",
        TITLE: "title",
        SUBTITLE: "subtitle",
        DIALOG: "dialog",
        DIALOG_RIGHT: "dialog_right"
    },
    ACTION_FIELDS: {
        NAME: "name",
        DESC: "desc",
        EXEC: "exec",
        TYPE: "type",
        GOTO: "goto" ,
        PORTRAIT: "portrait",
        TAG: "tag",
        CONDITION: "condition"
    },
    ACTION_TYPES: {
        HIDDEN: "hidden",
        SCENE: "scene",
        DIALOG: "dialog"
    },
    ELEMENTS: {
        TEMPLATES: {
            FULL: '<$$html_tag $$attrs>$$content</$$html_tag>',
            SHORT: '<$$html_tag $$attrs/>'
        },
        TAGS: {
            IMAGE: "img",
            LABEL: "label",
            CLICK: "button"
        },
        TYPES: {
            IMAGE: "image",
            LABEL: "label",
            CLICK: "click"
        }
    }
}

// === Shared Functions ===
JSPG['execCode'] = function (code) {
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
JSPG['uid'] = function () {
    const uid = [
        JSPG.GetCurrentScene().id, 
        '-'
    ]
    for (let i = 0; i < 10; ++i) {
        uid.push(this.Constants.UID_SEQ.selectRandom())
    }

    return uid.join('')
}

// === Public Functions ===
JSPG['PlayScenario'] = function (list, init_scene='Init') {
    this.Scenes = list
    return this.GoTo(init_scene)
    
}
JSPG['GoTo'] = function (name) {
    return this.SceneHandler.goTo(name)
}
JSPG['GetCurrentScene'] = function () {
    return JSPG.SceneHandler.currentScene
}

JSPG['Entities'] = {}
JSPG['Entities']['Scene'] = function (id) {
    this.id = id
    this.desc = []
    this.style = JSPG.Constants.BLOB_STYLES.SCENE_LEFT
    this.actions = []
    this.type = JSPG.Constants.SCENE_TYPES.SCENE
    this.portrait = ''
    this.pre_exec = ''
    this.post_exec = ''
    this.goto = ''

    this.fromConfig = function (sceneConfig) {
        log('Scene', `Generating new scene with type ${sceneConfig.hasOwnProperty("type") ? sceneConfig.type : JSPG.Constants.SCENE_TYPES.SCENE}`)
        for (const p in sceneConfig) {
            switch (p.toLowerCase()) {
                case JSPG.Constants.SCENE_FIELDS.DESC:
                    let desc = sceneConfig[p]
                    if (desc.constructor !== Array) {
                        desc = [desc]
                    }

                    this.desc = desc
                    break
                case JSPG.Constants.SCENE_FIELDS.ACTIONS:
                    this.setActions(sceneConfig[p])
                    break
                case JSPG.Constants.SCENE_FIELDS.TYPE:
                    this.type = sceneConfig[p].toLowerCase()
                    let style = JSPG.Constants.BLOB_STYLES.SCENE_LEFT
                    switch (this.type) {
                        case JSPG.Constants.SCENE_TYPES.TITLE:
                            style = JSPG.Constants.BLOB_STYLES.TITLE
                            break
                        case JSPG.Constants.SCENE_TYPES.SUBTITLE:
                            style = JSPG.Constants.BLOB_STYLES.SUBTITLE
                            break
                        case JSPG.Constants.SCENE_TYPES.DIALOG:
                            style = JSPG.Constants.BLOB_STYLES.DIALOG_LEFT
                            break
                        case JSPG.Constants.SCENE_TYPES.DIALOG_RIGHT:
                            style = JSPG.Constants.BLOB_STYLES.DIALOG_RIGHT
                            break
                    }
                    this.style = style
                    break
                case JSPG.Constants.SCENE_FIELDS.PORTRAIT:
                case JSPG.Constants.SCENE_FIELDS.PRE_EXEC:
                case JSPG.Constants.SCENE_FIELDS.POST_EXEC:
                case JSPG.Constants.SCENE_FIELDS.GOTO:
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
JSPG['Entities']['Action'] = function () {
    this.id = JSPG.uid()
    this.name = ""
    this.desc = ""
    this.exec = ""
    this.goto = ""
    this.type = JSPG.Constants.ACTION_TYPES.SCENE
    this.portrait = ""
    this.tag = ""
    this.available = true

    this.fromConfig = function (actionConfig) {
        for (const p in actionConfig) {
            switch (p.toLowerCase()) {
                case JSPG.Constants.ACTION_FIELDS.TYPE:
                    this.type = actionConfig[p].toLowerCase()
                    break
                case JSPG.Constants.ACTION_FIELDS.PORTRAIT:
                    this.portrait = "<img src='" + actionConfig[p] + "'/>"
                    break
                case JSPG.Constants.ACTION_FIELDS.CONDITION:
                    this.available = actionConfig[p]()
                    break
                case JSPG.Constants.ACTION_FIELDS.NAME:
                case JSPG.Constants.ACTION_FIELDS.DESC:
                case JSPG.Constants.ACTION_FIELDS.TAG:
                case JSPG.Constants.ACTION_FIELDS.EXEC:
                case JSPG.Constants.ACTION_FIELDS.GOTO:
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
JSPG['Entities']['Element'] = function(tag='') {
    this.id = JSPG.uid()
    this.tag = tag
    this.html_tag = ''
    this.template = ''
    this.attributes = {}
    this.content = ''
    this.eventHandlers = []
    
    this.AsImage = function(src) {
        this.html_tag = JSPG.Constants.ELEMENTS.TAGS.IMAGE
        this.template = JSPG.Constants.ELEMENTS.TEMPLATES.SHORT
        this.AddAttrs({'src': src})
        return this
    }
    
    this.AsLabel = function(text) {
        this.html_tag = JSPG.Constants.ELEMENTS.TAGS.LABEL
        this.template = JSPG.Constants.ELEMENTS.TEMPLATES.FULL
        this.content = text
        
        log('ElementEntity.AsLabel', `HTML Tag: ${this.html_tag}, Template: ${this.template}`)
        return this
    }
    
    this.AsClick = function(text) {
        this.html_tag = JSPG.Constants.ELEMENTS.TAGS.CLICK
        this.template = JSPG.Constants.ELEMENTS.TEMPLATES.FULL      
        this.content = text
        return this
    }
    
    this.Get = function() {
        const attrs = [
            `uid=${this.id}`,
            `tag=${this.tag}`           
        ]
        Object.keys(this.attributes).forEach(k => attrs.push(`${k}='${this.attributes[k]}'`))
        const attrLine = attrs.join(' ')
        
        console.log(attrLine)
        
        const html = this.template.replace('$$html_tag', this.html_tag)
                            .replace('$$attrs', attrLine)
                            .replace('$$content', this.content)
                            .replace('$$html_tag', this.html_tag)
        log('ElementEntity.Get', html)
        return html
    }
    
    this.AddAttrs = function(attrs) {        
        Object.assign(this.attributes, attrs)
        return this
    }
    
    this.SetTag = function(tag) {
        this.tag = tag
        return this
    }
    
    this.SetEventHandlers = function (ehs) {
        this.eventHandlers = ehs
    }
    
    this.AddEventHandler = function (event, callback, use_limit=-1, mark_disabled=false) {
        this.eventHandlers.push([event, callback, use_limit, mark_disabled])
    }
    
    this.findEventHandler = function (event) {
        return this.eventHandlers.find(eh => eh[0] == event)
    }
    
    this.RunEventHandler = function (event) {
        const eh = this.findEventHandler(event)
        if (!eh) return
        
        const callback = eh[1]
        const use_limit = eh[2]
        const disableOnLimit = eh[3]
        
        log('ElementEntity.RunEventHandler', `Running event [${event}] for element [${this.html_tag}/uid=${this.id} tag=${this.tag}]`)
        
        console.log(callback)
        callback()
        
        if (use_limit == -1) return
        
        const new_limit = use_limit - 1
        eh[2] = new_limit
        if (new_limit > 0) return
        
        log('ElementEntity.RunEventHandler', `Event handler reached its limit for event [${event}] for element [${this.html_tag}/uid=${this.id} tag=${this.tag}]`)

        this.RemoveEventHandler(event)
        if (disableOnLimit) {
            this.Disable()
        }
        
    }
    
    this.RemoveEventHandler = function (event) {
        const idx = this.eventHandlers.findIndex(eh=>eh[0]==event)
        if (idx < 0) return
        
        (this.Find()).off(event)
        this.eventHandlers.splice(idx,1)
        
        log('ElementEntity.RemoveEventHandler', `Event handler [${event}] for element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was removed!`)

    }
    
    this.Find = function () {
        $node = $(`${this.html_tag}[uid=${this.id}]`)
        if ($node.length == 0) return
        return $($node[0])
    }
    
    this.Disable = function() {
        const $node = this.Find()
        $node.off()
        $node.addClass('disabled') // TODO: Type specific class?
        
        this.eventHandlers.splice(0, this.eventHandlers.length)
        
        log('ElementEntity.Disable', `Element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
    }
}

JSPG['ActionHandler'] = new (function () {
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
        if (action.type == JSPG.Constants.ACTION_TYPES.HIDDEN) {
            return
        }

        let answerClass = JSPG.Constants.BLOB_STYLES.SCENE_RIGHT
        if (action.type == JSPG.Constants.ACTION_TYPES.DIALOG) {
            answerClass = JSPG.Constants.BLOB_STYLES.DIALOG_RIGHT
        }

        $("#scenes").append(
            "<div class='scene-description " + answerClass + "'>"
            + action.portrait
            + action.desc
            + "</div>"
        );

        setTimeout(function () {
            $(".scene-odd").css("opacity", 1);
        }, JSPG.Constants.TIMEOUTS.ACTION.SHOW_ANSWER);
    }

    this.executeAction = function (action) {
        setTimeout(() => {
            // If action exec code return False - GoTo will be ignored (e.g. action code invokes goTo)
            const execResult = JSPG.execCode(action.exec)
            if (
                (typeof execResult != "undefined" && !execResult)
                || action.goto == ""
            ) {
                log('AH.OnActionExecute', 'Skip action\'s GoTo')
                return
            }

            log('AH.OnActionExecute', `GoTo: ${action.goto}`);
            JSPG.SceneHandler.goTo(action.goto)
        }, JSPG.Constants.TIMEOUTS.ACTION.EXECUTE);
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
        }, JSPG.Constants.TIMEOUTS.ACTION.SHOW_OPTIONS);
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
})()
JSPG['SceneHandler'] = new (function () {
    this.currentSceneId = -1
    this.currentScene = {}
    this.AH = JSPG.ActionHandler

    this.goTo = function (SceneName) {
        setTimeout(()=>{
            this.showScene(JSPG.Scenes[SceneName])
        }, JSPG.Constants.TIMEOUTS.GOTO)
    };

    this.composeBlob = function (frame) {
        const scene = this.currentScene

        // Run interpretation on desired description lines
        let desc = scene.desc[frame]

        // Set portrait img node
        let $portrait = scene.portrait;
        if (scene.type == JSPG.Constants.SCENE_TYPES.DIALOG && $portrait != "") {
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
        const scene = new JSPG.Entities.Scene(sceneId)
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
        const baseTimeout = JSPG.Constants.TIMEOUTS.SCENE.SHOW
        $("#scenes").append(`<span scene-id=${sceneId}></span>`)
        for (let frame = 0; frame < framesAmount; ++frame) {
            const $blob = this.composeBlob(frame)
            $(`span[scene-id=${sceneId}]`).append($blob)
            
            const frameTimeout = JSPG.Constants.TIMEOUTS.SCENE.STEP * frame
            setTimeout(() => {
                log('ShowScene.On Blob Render Timeout', `Rendering scene ${sceneId}, frame ${frame}`)
                const element = `span[scene-id=${sceneId}] .scene-description[frame=${frame}]`
                $(element).css("opacity", 1)
                $(element).scrollTo()
            }, (baseTimeout + frameTimeout))
        }

        // Set up scene finalizer timer
        const timeout = JSPG.Constants.TIMEOUTS.SCENE.SHOW + (JSPG.Constants.TIMEOUTS.SCENE.STEP * framesAmount)
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
        return JSPG.execCode(this.currentScene.pre_exec)
    };

    this.execPostScene = function () {
        log('PostScene', `[id:${this.currentSceneId}] Executing post-scene code`)
        JSPG.execCode(this.currentScene.post_exec)

        const goToScene = this.currentScene.goto
        if (goToScene == "") { return }

        log('PostScene', `[id:${this.currentSceneId}] GoTo navigation to ${goToScene}`);
        this.goTo(goToScene)
    };
})();
JSPG['ElementsHandler'] = new (function () {
    this.elements = []  // list of custom elements objects
    
    this.enableElements = function () {
        // Activates element's event handlers. Invoked on scene rendering.
        this.elements.forEach(el => {
            const $node = el.Find()
            if (typeof $node == typeof "undefined") return
        
            $node.off()
            el.eventHandlers.forEach(eh => {
                $node.on(eh[0], event => el.RunEventHandler(eh[0]))
            })        
        })
    }
    
    this.clearElementsList = function () {
        this.elements.forEach(this.disableElement)
        this.elements.splice(0, this.elements.length)
    }
    
    this.disableElement = function (el) {
        const node = el.Find()
        node.off()
        node.addClass('disabled')
    }

    this.createElement = function (type, tag='', content='', attributes={}, eventsHandlers=[]) {
        log('Elements.createElement', `Type: ${type}, Content: ${content}`)
        let element = new JSPG.Entities.Element(tag)
        switch (type.toLowerCase()) {
            case JSPG.Constants.ELEMENTS.TYPES.LABEL:
                log('Elements.createElement', 'Creating LABEL')
                element.AsLabel(content)
                
                console.log(element.html_tag)
                break
            case JSPG.Constants.ELEMENTS.TYPES.IMAGE:
                element.AsImage(content)
                break
            case JSPG.Constants.ELEMENTS.TYPES.CLICK:
                element.AsClick(content)
                break
        }
        
        
        console.log(element.html_tag)
        element.AddAttrs(attributes).        SetEventHandlers(eventsHandlers)
        
        console.log(element.html_tag)
        this.elements.push(element)
        return element
    }
    
    this.findIndexByTag = function (tag) {
        return this.elements.findIndex(e => e.tag == tag)
    }
    
    this.findByTag = function (tag) {
        return this.elements.find(el => el.tag == tag)
    }
    
    this.deleteElement = function (tag) {
        const elIdx = this.findIndexByTag(tag)
        if (typeof elIdx < 0) return
        
        this.disableElement(this.elements[elIdx])
        this.elements.splice(elIdx, 1)
    }
    
    
})
JSPG['Helper'] =  new (function() {
    this.Click = function(text, callback, tag='', use_limit=1) {
        const element = JSPG.ElementsHandler.createElement(
            JSPG.Constants.ELEMENTS.TYPES.CLICK, 
            tag, 
            text
        )
        element.AddEventHandler("click", callback, use_limit)
        
        return element.Get()
        /*
        const inline_action = JSPG.ActionHandler.addInlineAction(text, callback, tag, use_limit)
        return inline_action.compose()
        */
    }
    this.Img = function(uri, tag='', attrs={}) {
        const element = JSPG.ElementsHandler.createElement(JSPG.Constants.ELEMENTS.TYPES.IMAGE, tag, uri, attrs)
        return element.Get()
    }
    this.Label = function(text, tag='', attrs={}) {
        const element = JSPG.ElementsHandler.createElement(JSPG.Constants.ELEMENTS.TYPES.LABEL, tag, text, attrs)
        return element.Get()
    }

    this.Find = {
        ByTag: function(tag) {
            return JSPG.ElementsHandler.findByTag(tag)
            // return $(`*[tag=${tag}]`)[0]
        }
    }

    this.desc = {
        set: function(lines) {
            JSPG.GetCurrentScene().desc = lines
        },

        add: function(line) {
            JSPG.GetCurrentScene().desc.push(line)
        },

        addFirst: function(line) {
            JSPG.GetCurrentScene().desc.unshift(line)
        },

        putAt: function (line, idx) {
            JSPG.GetCurrentScene().desc.splice(idx, 0, line)
        },

        clear: function(line) {
            JSPG.GetCurrentScene().desc = []
        },

        deleteAt: function(idx, size=1) {
            JSPG.GetCurrentScene().desc.splice(idx, size)
        }
    }

    this.actions = {
        set: function(action_list) {
            JSPG.GetCurrentScene().setActions(action_list)
        },

        add: function(action_cfg) {
            JSPG.GetCurrentScene().addAction(action_cfg)
        },

        addFirst: function(action_cfg) {
            JSPG.GetCurrentScene().insertAction(action_cfg, 0)
        },

        putAt: function (action_cfg, idx) {
            JSPG.GetCurrentScene().insertAction(action_cfg, idx)
        },

        getByTag: function (tag) {
            return JSPG.GetCurrentScene().getActionByTag(tag)
        },

        clear: function(line) {
            JSPG.GetCurrentScene().clearActions()
        },

        deleteAt: function(idx, size=1) {
            JSPG.GetCurrentScene().deleteActionAt(idx, size)
        },

        deleteByTag: function (tag) {
            JSPG.GetCurrentScene().deleteActionByTag(tag)
        }
    }
})()


// === Start ===
const $h = JSPG.Helper
$( document ).ready(function() {
    
    JSPG.PlayScenario(Scenes, 'Init')
});
