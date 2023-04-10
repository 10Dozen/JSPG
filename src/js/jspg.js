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

// === JSPG ===
const JSPG = {
    Meta: {
        name: 'Untitled',
        author: 'Unknown',
        version: '0.0.1',
        guid: '',
        JSPGVersion: '0.13.0'
    },
    Settings: {
        onVersionMismatch: (savedVersion)=>{}  // function to run on load game when version mismatched
    },
    Scenes: [],
    Screens: []
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
    },
    SCREENS: {
        TYPES: {
            SIMPLE_MENU: 'simple_menu'
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
JSPG['normalizeAndCopyToObject'] = function (objSource, objTarget, propsToNormalize, callbackForProps={}) {
    const selfNormalization = objTarget == null
    if (selfNormalization) {
        objTarget = objSource
    }

    for (const key in objSource) {
        const propCallback = Object.keys(callbackForProps).find(el => el.toLowerCase() == key.toLowerCase())
        let value = objSource[key]
        if (propCallback) {
            const bindedCallback = callbackForProps[propCallback].bind(objTarget)
            value = bindedCallback(value)
        }
        if (typeof value == 'undefined') continue

        const normalizedPropName = propsToNormalize.find(el => el.toLowerCase() == key.toLowerCase())
        if (!normalizedPropName) {
            objTarget[key] = value
        } else {
            console.log(`Key ${key} should be normalized`)
            objTarget[normalizedPropName] = value
            if (selfNormalization && key !== normalizedPropName) {
                console.log('Key deleted after normalization')
                delete objTarget[key]
            }
        }
    }
}

// === Public Functions ===
JSPG['PlayScenario'] = function (scenes, screens, init_scene='Init') {
    this.Scenes = scenes
    this.Screens = screens
    if (scenes.hasOwnProperty('Meta')) {
        this.normalizeAndCopyToObject(
            scenes.Meta,
            this.Meta,
            ['guid','name','author','version']
        )
    }

    if (scenes.hasOwnProperty('Settings')) {
       this.normalizeAndCopyToObject(
           scenes.Settings,
           this.Settings,
           ['onVersionMismatch']
       )
    }

    $("game-title").html(`${this.Meta.name}, <small>v.${this.Meta.version} by ${this.Meta.author}</small>`)
    JSPG.MenuHandler.addSystemScreens()

    return this.GoTo(init_scene)
}
JSPG['GoTo'] = function (name) {
    return this.SceneHandler.goTo(name)
}
JSPG['GetCurrentScene'] = function () {
    return JSPG.SceneHandler.currentScene
}

JSPG['Entities'] = {}
JSPG['Entities']['Scene'] = function (id, name) {
    this.id = id
    this.name = name
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

        propCallbacks = {}
        propCallbacks[JSPG.Constants.SCENE_FIELDS.DESC] = desc => Array.isArray(desc) ? desc : [desc]
        propCallbacks[JSPG.Constants.SCENE_FIELDS.ACTIONS] = actions => this.setActions(actions)
        propCallbacks[JSPG.Constants.SCENE_FIELDS.TYPE] = type => {
            let style = JSPG.Constants.BLOB_STYLES.SCENE_LEFT
            switch (type.toLowerCase()) {
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
            return type.toLowerCase()
        }

        JSPG.normalizeAndCopyToObject(sceneConfig, this,
                                      Object.values(JSPG.Constants.SCENE_FIELDS),
                                      propCallbacks)

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
        propsCallbacks = {}
        propsCallbacks[JSPG.Constants.ACTION_FIELDS.TYPE] = type => type.toLowerCase()
        propsCallbacks[JSPG.Constants.ACTION_FIELDS.PORTRAIT] = img => `<img src='${img}'/>`
        propsCallbacks[JSPG.Constants.ACTION_FIELDS.CONDITION] = condition => condition()
        JSPG.normalizeAndCopyToObject(actionConfig, this,
                                      Object.values(JSPG.Constants.ACTION_FIELDS),
                                      propsCallbacks)

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
        this.eventHandlers.splice(0, this.eventHandlers.length)

        const $node = this.Find()
        if (!$node) return

        $node.off()
        $node.prop('disabled', true)
        log('ElementEntity.Disable', `Element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
    }
}
JSPG['Entities']['ScreenTemplates'] = {}
JSPG['Entities']['ScreenTemplates'][JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU] = function () {
    this.type = JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU
    this.title = ''
    this.content = []
    this.onClickHandlers = []
    this.HEADER_CLASS = 'simple-menu-header'
    this.CONTENT_CLASS = 'simple-menu-content'
    this.FIELDS = {
        TITLE: 'title',
        CONTENT: 'content',
        PRE_EXEC: 'pre_exec'
    }
    this.FIELDS_CONTENT = {
        TITLE: 'title',
        NAVIGATETO: 'navigateto',
        ONCLICK: 'onclick',
    }

    this.fromConfig = function (config) {
        propCallbacks = {}
        propCallbacks[this.FIELDS.CONTENT] = list => {
            const normalizedList = []
            list.forEach(el => {
                let normalizedElement = {}
                JSPG.normalizeAndCopyToObject(el,
                    normalizedElement,
                    Object.values(this.FIELDS_CONTENT))
                normalizedList.push(normalizedElement)
            })
            return normalizedList
        }

        JSPG.normalizeAndCopyToObject(config, this,
                                      Object.values(this.FIELDS),
                                      propCallbacks)

        if (!this.hasOwnProperty('pre_exec')) return this

        // Pre_exec may change fields read from config
        // and changed fields may need again normalization
        this.pre_exec(this)
        JSPG.normalizeAndCopyToObject(this, null, Object.values(this.FIELDS), propCallbacks)

        return this
    }

    this.Get = function () {
        const html = []
        this.onClickHandlers.length = 0
        if (this.title != '') {
            html.push(`<div class='${this.HEADER_CLASS}'>${this.title}</div>`)
        }

        html.push(`<div class='${this.CONTENT_CLASS}'>`)
        this.content.forEach((content, idx) => {
            console.log('For each content (idx:' + idx)
            console.log(content)

            const onClickCode = []
            if (typeof content.onclick != 'undefined') {
                this.onClickHandlers[idx] = content.onclick
                onClickCode.push(`JSPG.MenuHandler.onScreenElementClick(${idx})`)

                console.log('OnClick code defined - setting on click handler')
                console.log(onClickCode)
            }
            if (typeof content.navigateto != 'undefined') {
                onClickCode.push(` JSPG.MenuHandler.ShowScreen(\"${content.navigateto}\") `)
                console.log('NavigateTo defined - adding destination')
                console.log(onClickCode)
            }
            console.log(onClickCode)

            this.onClickHandlers.push(content.onClick)
            html.push(`<a href='#' onclick='${onClickCode.join(';')}'>${content.title}</a>`)
        })
        html.push(`</div>`)
        html.push(`<a href="javascript:void(0)" class="closebtn" onclick="JSPG.MenuHandler.HideScreen()">&times;</a>`)

        return html.join('')
    }
}


JSPG['ActionHandler'] = new (function () {
    this.actions = []
    this.getActionById = function (id) {
        return this.actions.find(action => { return action.id === id })
    };

    this.clearActionList = function () {
        this.actions.splice(0, this.actions.length)
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
    };
})()
JSPG['ElementsHandler'] = new (function () {
    this.elements = []  // list of custom elements objects

    this.enableElements = function () {
        // Activates element's event handlers. Invoked on scene rendering.
        this.elements.forEach(el => {
            const $node = el.Find()
            if (typeof $node == "undefined") return

            $node.off()
            el.eventHandlers.forEach(eh => {
                $node.on(eh[0], event => el.RunEventHandler(eh[0]))
            })
        })
    }

    this.clearElementsList = function () {
        console.log(`Elements size ${this.elements.length}`)
        this.elements.forEach(el => {console.log(el); el.Disable()})
        this.elements.splice(0, this.elements.length)
    }

    this.createElement = function (type, tag='', content='', attributes={}, eventsHandlers=[]) {
        log('Elements.createElement', `Type: ${type}, Content: ${content}`)
        let element = new JSPG.Entities.Element(tag)
        switch (type.toLowerCase()) {
            case JSPG.Constants.ELEMENTS.TYPES.LABEL:
                log('Elements.createElement', 'Creating LABEL')
                element.AsLabel(content)
                break
            case JSPG.Constants.ELEMENTS.TYPES.IMAGE:
                element.AsImage(content)
                break
            case JSPG.Constants.ELEMENTS.TYPES.CLICK:
                element.AsClick(content)
                break
        }

        element.AddAttrs(attributes)
        element.SetEventHandlers(eventsHandlers)

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

        this.elements[elIdx].Disable()
        this.elements.splice(elIdx, 1)
    }
})()
JSPG['SceneHandler'] = new (function () {
    this.currentSceneId = -1
    this.currentScene = {}
    this.AH = JSPG.ActionHandler
    this.EH = JSPG.ElementsHandler

    this.goTo = function (SceneName) {
        setTimeout(()=>{
            this.showScene(SceneName, JSPG.Scenes[SceneName])
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

    this.showScene = function (name, sceneConfig)  {
        const sceneId = ++this.currentSceneId;
        log('ShowScene', `---------- Rendering new scene with id ${sceneId}: ${name} ----------`)
        // Drop actions before any next step
        this.AH.hideActionButtons();
        this.EH.clearElementsList();

        // Copy scene object to safely apply pre-exec code:
        const scene = new JSPG.Entities.Scene(sceneId, name)
        scene.fromConfig(sceneConfig)
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

            log('ShowScene', `[id:${sceneId}]              Executing post scene`)
            this.execPostScene()

            log('ShowScene', `[id:${sceneId}]              Enabling elements`)
            this.EH.enableElements()
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
    }

    this.clearOutput = function (sys_msg='') {
        $('#scenes').html('')
        if (sys_msg == '') return

        const style = JSPG.Constants.BLOB_STYLES.SUBTITLE
        $('#scenes').append(`<div class='scene-description ${style}'>${sys_msg}</div>`)
    }
})()
JSPG['MenuHandler'] = new (function () {
    this.items = []
    this.currentScreen = null

    this.Constants = {
        BUTTON_CLASS_PREFIX: 'menu-button-idx-'
    }

    this.Entity = {
        Icon: function (img, text, icon_class) {
            this.img = !img ? '' : img
            this.text = !text ? '' : text
            this.class = !icon_class ? '' : icon_class

            this.get = function() {
                const content = this.img == ''
                                ? this.text
                                : `<img src='${this.img}' alt='${this.text}' />`
                return `<i class='menu-button-icon ${this.class}'>${content}</i>`
            }
        },
        Button: function (tag, positionIdx, title, icon, onClick, attrs={}) {
            this.positionIdx = positionIdx
            this.tag = tag
            this.title = title
            this.icon = icon
            this.onClick = onClick
            this.attributes = attrs

            this.get = function () {
                const attrs = {
                    posid: this.positionIdx,
                    tag: tag ,
                    onclick: "JSPG.MenuHandler.OnMenuItemClick(this)"
                }
                Object.assign(attrs, this.attributes)

                const classByIdx = `${JSPG.MenuHandler.Constants.BUTTON_CLASS_PREFIX}${this.positionIdx}`
                attrs['class'] = attrs.hasOwnProperty('class')
                                 ? `${attrs['class']} ${classByIdx}`
                                 : classByIdx

                const attrsList = []
                Object.keys(attrs).forEach(key=>attrsList.push(`${key}='${attrs[key]}'`))

                return `<button ${attrsList.join(' ')}>${this.icon}${this.title}</button>`
            }

            this.find = function () {
                return $(`#menu button[posid=${this.positionIdx}]`)
            }

            this.updatePositionIdx = function (newPositionIdx) {
                const $element = this.find()
                $element.attr({posid: newPositionIdx})
                $element.removeClass(`${JSPG.MenuHandler.Constants.BUTTON_CLASS_PREFIX}${this.positionIdx}`)
                $element.addClass(`${JSPG.MenuHandler.Constants.BUTTON_CLASS_PREFIX}${newPositionIdx}`)

                this.positionIdx = newPositionIdx
            }

            this.enable = function () { this.find().attr('disabled', false) }
            this.disable = function () { this.find().attr('disabled', true) }
        }
    }

    // Protected-like
    this.AddMenuItem = function (tag, title, iconData, onclick, attrs={}) {
        let icon = iconData == null
                   ? ''
                   : (new this.Entity.Icon(iconData.img, iconData.text, iconData.class)).get()
        const item = new this.Entity.Button(tag,
                                        positionIdx=this.items.length,
                                        title,
                                        icon,
                                        onclick,
                                        attrs)
        this.items.push(item)
        const html = item.get()
        $("#menu").append(html)
    }

    this.RemoveMenuItem = function (findBy) {
        // findBy may be integer (position idx) or string (tag name)
        [idx, item] = this.findMenuItem(findBy)
        if (item == null) return

        item.find().remove()
        this.items.splice(idx, 1)
        this.updateMenuItems()
    }

    this.ClearMenuItems = function () {
        this.items.forEach(item => item.find().remove())
        this.items.splice(0, this.items.length)
    }

    this.DisableMenuItem = function (findBy) {
        [idx, item] = this.findMenuItem(findBy)
        if (item == null) return

        item.disable()
    }

    this.EnableMenuItem = function (findBy) {
        [idx, item] = this.findMenuItem(findBy)
        if (item == null) return

        item.enable()
    }

    this.OnMenuItemClick = function (btn) {
        const posid = btn.getAttribute('posid')
        return this.items[posid].onClick()
    }

    this.GetCurrentScreen = function () {
        return this.currentScreen;
    }

    this.ShowScreen = function (screenName) {
        const screenConfig = JSPG.Screens[screenName]
        const typeKey = Object.keys(screenConfig).find(key => key.toLowerCase() == 'type')
        if (!typeKey) return

        const screen = new JSPG.Entities.ScreenTemplates[screenConfig[typeKey]]()
        screen.fromConfig(screenConfig)

        this.currentScreen = screen
        this.UpdateScreenContent()

        document.getElementById("overlay").style.width = "100%"
    }

    this.UpdateScreenContent = function (html) {
        // Replace screen content with given HTML or by screen's Get() method
        if (typeof html != 'undefined') {
            $("#overlay").html(html)
        }
        if (this.currentScreen == null) return
        $("#overlay").html(this.currentScreen.Get())
    }

    this.HideScreen = function () {
        document.getElementById("overlay").style.width = "0%"
        this.currentScreen = null
        this.UpdateScreenContent(html='')
    }

    this.AddMainMenuButton = function () {
        this.AddMenuItem(tag='main-menu-button',
                         title='Menu',
                         iconData=null,
                         onClick=() => { this.ShowScreen('Main') },
                         attr={class: 'menu-button-main'})
    }

    // Private-like
    this.updateMenuItems = function () {
        for (let idx = 0; idx < this.items.length; ++idx) {
            this.items[idx].updatePositionIdx(idx)
        }
    }

    this.findMenuItem = function (findBy) {
        // findBy may be integer (position idx) or string (tag name)
        let idx = (typeof findBy == typeof "")
                  ? this.items.findIndex(item => item.tag == findBy)
                 : findBy
        if (idx < 0 || idx >= this.items.length) return [-1, null]

        return [idx,  this.items[idx]]
    }

    this.onScreenElementClick = function (eventHandlerIdx) {
        console.log(`Menu.onScreenElementClick/ Handler id = ${eventHandlerIdx}`)
        const handler = this.currentScreen.onClickHandlers[eventHandlerIdx]
        if (typeof handler == 'undefined') return

        console.log('Menu.onScreenElementClick/ Invoking event handler for click')
        handler()
    }

    this.addSystemScreens = function () {
        JSPG.Screens.SaveGameScreen = {
            type: JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU,
            title: 'Save Game',
            pre_exec: JSPG.Persistence.formatSaveMenuScreen.bind(JSPG.Persistence)
        }

        JSPG.Screens.LoadGameScreen = {
            type: JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU,
            title: 'Load Game',
            pre_exec: JSPG.Persistence.formatLoadMenuScreen.bind(JSPG.Persistence)
        }

        JSPG.Screens.AboutScreen = {
            type: JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU,
            title: 'About',
            content: [
                {title: `${JSPG.Meta.name}`},
                {title:`by ${JSPG.Meta.author}`},
                {title:`Version ${JSPG.Meta.version}`},
                {title:`Game UID: ${JSPG.Meta.guid}`},
                {title:''},
                {title:`Powered by JSPG version ${JSPG.Meta.JSPGVersion}`}
            ]
        }
    }

})()

JSPG['Persistence'] = new (function () {
    this.subscribers = []
    this.customSaveObject = null

    this.Entity = {
        Save: function (customDictionary) {
            this.currentSceneName = JSPG.GetCurrentScene().name
            this.custom = customDictionary

            this.subscribers = {}
            JSPG.Persistence.subscribers.forEach(sub => {
                const name = sub[0]
                const obj = sub[1]
                this.subscribers[name] = JSON.stringify(obj)
            })
        },

        Metadata: function () {
            this.date = new Date()
            this.version = JSPG.Meta.version
        }
    }

    this.getKeyBySlotId = function (slot_id) {
        const guid = JSPG.Meta.guid
        const prefix = `${guid}+${slot_id}`
        return {
            meta: `${prefix}_meta`,
            data: `${prefix}_savegame`
        }
    }

    this.Save = function (slot_id) {
        const target = this.getKeyBySlotId(slot_id)

        const meta = new this.Entity.Metadata()
        const data = new this.Entity.Save(this.customSaveObject)
        window.localStorage.setItem(target.meta, JSON.stringify(meta))
        window.localStorage.setItem(target.data, JSON.stringify(data))

        log('Persistence', `Game was saved to slot ${slot_id} -> [${target.data}]`)
    }

    this.Load = function (slot_id) {
        const target = this.getKeyBySlotId(slot_id)
        log('Persistence', `Game was loaded from slot ${slot_id} -> [${target.data}]`)
        const meta = window.localStorage.getItem(target.meta)
        const data = window.localStorage.getItem(target.data)

        if (!meta) return

        const parsedMeta = JSON.parse(meta)
        console.log(parsedMeta)
        if (JSPG.Meta.version != parsedMeta.version) {
            console.log(`Saved game version mismatch! Current game version ${JSPG.Meta.version}, but saved game has ${parsedMeta.version}`)
            JSPG.Settings.onVersionMismatch(parsedMeta.version)
        }

        const parsedData = JSON.parse(data)
        console.log(parsedData)

        this.subscribers.forEach(sub => {
            const name = sub[0]
            const obj = sub[1]
            const rules = sub[2]

            this.loadObject(obj, JSON.parse(parsedData.subscribers[name]), rules)
            console.log(obj)
        })

        // todo: restore scene
        log('Persistence.Load', `Loading scene ${parsedData.currentSceneName}`)
        JSPG.SceneHandler.clearOutput(`Game loaded (slot ${slot_id})`)
        JSPG.GoTo(parsedData.currentSceneName)

        return parsedData.custom
    }

    this.Delete = function (slot_id) {
        const target = this.getKeyBySlotId(slot_id)
        window.localStorage.removeItem(target.meta)
        window.localStorage.removeItem(target.data)
        log('Persistence', `Save file [${target.data}] was deleted!`)
    }

    this.Subscribe = function(name, obj, rules) {
        this.subscribers.push([name, obj, rules])
    }

    this.Unsubsribe = function(name) {
        const idx = this.subscribers.findIndex(el => el[0] == name)
        this.subscribers.splice(idx, 1)
    }

    this.SetSaveObject = function (saveObject) {
        this.customSaveObject = saveObject
    }

    this.loadObject = function (obj, dataObj, rules={}) {
        for (const k in obj) {
            //log("loadObject", `Checking key [${k}]`)
            // Skip if there is no saved data for this key
            if (!dataObj.hasOwnProperty(k)) {
                log("loadObject", `SKIP. Saved object doesnt contain key [${k}]`)
                continue
            }

            // Skip if data type is different
            if (typeof obj[k] != typeof dataObj[k]) {
                log("loadObject", `SKIP. Target and saved object key [${k}] data type mismatch!`)
                continue
            }

            let rule = true
            let isRuleContainer = false
            const hasRule = rules.hasOwnProperty(k)
            if (hasRule) {
                rule = rules[k]
                isRuleContainer = (typeof rule == typeof Object.prototype) && Array.isArray(rule)
            }

            //log("loadObject", `HasRule: ${hasRule}, isContainer: ${isRuleContainer}, rule: ${rule}`)

            // Skip if rules is bool and mark this field as skippable
            if (hasRule && !isRuleContainer && !rule) {
                log("loadObject", `SKIP. Rule restricts copying of key [${k}]`)
                continue
            }

            if (typeof obj[k] == typeof Object.prototype) {
                // Replace if array
                if (Array.isArray(obj[k])) {
                    //log("loadObject", `Copy ARRAY value`)
                    obj[k] = dataObj[k]
                    continue
                }
                // or invoke function recursevely for deep copy
                //log("loadObject", `Invoking loadObject for nested object!`)
                this.loadObject(obj[k], dataObj[k], rule)
                continue
            } else {
                // Replace if data is not a container
                //log("loadObject", `Copy SIMPLE value!`)
                obj[k] = dataObj[k]
            }

            //log("loadObject", `=== Finished for key [${k}] ===`)
        }

        log("loadObject", `Finished!`)
    }

    this.formatLoadMenuScreen = function (screen) {
        screen.content = []
        for (let i = 0; i < 10; ++i) {
            let title = `Slot ${i + 1} -- Empty slot`
            let onClick = ()=>{}
            const slot = this.getKeyBySlotId(i)
            const metaString = window.localStorage.getItem(slot.meta)

            if (metaString != null) {
                const meta = JSON.parse(metaString)
                const date = new Date(meta.date)
                console.log(meta)
                title = `Slot ${i + 1} -- ${date.toDateString()} ${date.toLocaleTimeString()} -- Game Version: ${meta.version}`
                onClick = () => {
                    JSPG.MenuHandler.HideScreen();
                    setTimeout(() => { JSPG.Persistence.Load(i); }, 100)
                }
            }
            screen.content.push({title: title, onClick: onClick})
        }
    }

    this.formatSaveMenuScreen = function (screen) {
        screen.content = []
        const onClick = function (slot_id) {
            JSPG.Persistence.Save(slot_id);
            JSPG.MenuHandler.HideScreen();
        }

        for (let i = 0; i < 10; ++i) {
            let title = `Slot ${i + 1} -- Empty slot`

            const slot = this.getKeyBySlotId(i)
            const metaString = window.localStorage.getItem(slot.meta)
            console.log(metaString)
            if (metaString != null) {
                const meta = JSON.parse(metaString)
                const date = new Date(meta.date)
                title = `Slot ${i + 1} -- ${date.toDateString()} ${date.toLocaleTimeString()} -- Game Version: ${meta.version}`
            }

            console.log('formatSaveManu/ Result:')
            console.log(title)
            console.log(onClick.bind(null, i))
            screen.content.push({title: title, onClick: onClick.bind(null, i)})
        }
    }
})()
JSPG['Helper'] =  new (function() {
    this.Click = function(text, callback, tag='', use_limit=1) {
        const element = JSPG.ElementsHandler.createElement(
            JSPG.Constants.ELEMENTS.TYPES.CLICK,
            tag,
            text
        )
        element.AddEventHandler("click", callback, use_limit, true)
        element.AddAttrs({class: "inline-button"})

        return element.Get()
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
            return JSPG.ElementsHandler.findByTag(tag).Find()
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
const Scenes = {}
const Screens = {}

$( document ).ready(function() {
    JSPG.PlayScenario(scenes=Scenes, screens=Screens, init_scene='Init')
    JSPG.MenuHandler.AddMainMenuButton()
});
