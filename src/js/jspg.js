// Version: 0.13.0.201
// Build date: 2023-07-02 15:44:18.106257

// === Expansion functions ==
Array.prototype.purge = function (func, thisArg) {
    return this.splice(0, this.length)
}

Array.prototype.selectRandom = function(func, thisArg) {
    return this[Math.floor(Math.random() * this.length)]
}

String.prototype.format = function (...options) {
    /* Returns string formatted by given keys
        'My name is {name}, {age}'.format({age=22, name='John'})  => 'My name is John, 22'
        'My name is {name}'.format('name', 'John') => 'My name is John'
    */
    let resultStr = this.toString()
    if (options.length == 0) return resultStr

    let formatMap = null
    if (typeof options[0] == typeof "") {
        formatMap = {}
        formatMap[options[0]] = options[1]
    } else {
        formatMap = options[0]
    }
    for (const k in formatMap) {
        const keyToReplace= '{' + k + '}'
        while (resultStr.includes(keyToReplace)) {
            resultStr = resultStr.replace('{' + k + '}', formatMap[k])
        }
    }

    return resultStr
};

Element.prototype.attrsModify = function() {
    /*  Use cases:
        .attrsModify('class', 'my-class', false)
        .attrsModify('src', 'myimg.jpg')
        .attrsModify({src: myimg.jpg, class: 'myclass'}, false)
    */
    if (arguments.length == 0) return

    let attrObj = null
    let override = true

    if (typeof arguments[0] == typeof "") {
        attrObj = {}
        attrObj[arguments[0]] = arguments[1]
        override = arguments[2] != undefined
                   ? arguments[2]
                   : override
    } else {
        attrObj = arguments[0]
        override = arguments[1] != undefined
                   ? arguments[1]
                   : override
    }

    for (let key in attrObj) {
        //console.log(`${key} = ${attrObj[key]}`)
        const value = attrObj[key]
        key = key.toLowerCase()
        const isClass = key == 'class'
        const isStyle = key == 'style'

        // Attribures deletion case
        if (value == null || value === '') {
            //console.log('Deletion route')
            if (!override) continue
            if (isClass) {
                this.className = ''
                continue
            }

            this.removeAttribute(key)
            continue
        }

        // Attribute force add case
        if (override) {
            //console.log('Force add/override route')
            if (isClass) {
                this.className = value
                continue
            }

            this.setAttribute(key, value)
            continue
        }

        // Append or create key-value if none
        //console.log('Add/append route')
        if (isClass) {
            this.classList.add(value)
            continue
        }
        if (isStyle) {
            const currentStyle = this.getAttribute('style')
            this.setAttribute(key, `${currentStyle};${value}`)
            continue
        }
        this.setAttribute(key, value)
    }
}

const Logger = function (component, level=2) {
    this.LOG_LEVELS = {
        ERROR: 0,
        WARNING: 1,
        INFO: 2,
        DEBUG: 3
    }
    this.LOG_LEVEL_SUFFIX = {
        0: 'ERR',
        1: 'WARN',
        2: 'INFO',
        3: 'DBG'
    }

    this.level = level
    this.prefix = component

    this.getMsgPrefix = function (lvl) {
        return `[JSPG/${this.prefix}](${this.LOG_LEVEL_SUFFIX[lvl]})`
    }

    this.isLogLevelAllowed = function (lvlToCheck) {
        return lvlToCheck <= this.level
    }

    this.error = function (...msg) {
        const lvl = this.LOG_LEVELS.ERROR
        if (!this.isLogLevelAllowed(lvl)) return
        console.error(this.getMsgPrefix(lvl), ...msg)
    }
    this.err = this.error

    this.warning = function (...msg) {
        const lvl = this.LOG_LEVELS.WARNING
        if (!this.isLogLevelAllowed(lvl)) return
        console.warn(this.getMsgPrefix(lvl), ...msg)
    }
    this.warn = this.warning

    this.info = function (...msg) {
        const lvl = this.LOG_LEVELS.INFO
        if (!this.isLogLevelAllowed(lvl)) return
        console.log(this.getMsgPrefix(lvl), ...msg)
    }

    this.debug = function (...msg) {
        const lvl = this.LOG_LEVELS.DEBUG
        if (!this.isLogLevelAllowed(lvl)) return
        console.log(this.getMsgPrefix(lvl), ...msg)
    }
}

const JSPG = {
    Meta: {
        name: 'Untitled',
        author: 'Unknown',
        version: '0.0.1',
        guid: '',
        JSPGVersion: '0.13.0'
    },
    Settings: {
        allowHotkeyActionSelection: true,
        showHotkeyActionDefaultIcons: true,
        onVersionMismatch: (savedVersion)=>{},  // function to run on load game when version mismatched
        onBeforeGameSaved: (customSaveObject) => {},
        onAfterGameLoaded: (loadedSaveObject, customSaveObject) => {}
    },
    Constants: {},
    Maps: {},
    Entities: {},
    ScreenTemplates: {},
    Scenes: [],
    Screens: [],
}

JSPG.Constants = {
    UID_SEQ: ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'],
    INLINE_TOKEN_SEPARATOR: '|',
    INLINE_TOKENS_TYPES: {
        SCENE_CENTER: '^',
        SCENE_LEFT: '<',
        SCENE_RIGHT: '>',
        DIALOG_LEFT: '<#',
        DIALOG_RIGHT: '#>',
        TITLE: 'T',
        SUBTITLE: 'ST',
        HIDDEN: 'HID',
        CONTAINER: 'C'
    },
    INLINE_EXECUTE_TOKEN: '>>>',
    TIMEOUTS: {
        ACTION: {
            SHOW_OPTIONS: 500,
            BEFORE_EXECUTE: 200,
            AFTER_EXECUTE: 200,
            SHOW_ANSWER: 200,
            AFTER_ANSWER: 500,
        },
        SCENE: {
            SHOW: 200,
           STEP: 300
        },
        GOTO: 50
    },
    BLOB_STYLES: {
        SCENE_CENTER: "scene-center",
        SCENE_LEFT: "scene-even",
        SCENE_RIGHT: "scene-odd",
        DIALOG_LEFT: "scene-even portrait portrait-left",
        DIALOG_RIGHT: "scene-odd portrait portrait-right",
        TITLE: "scene-title",
        SUBTITLE: "scene-subtitle",
        CONTAINER: "container"
    },
    BLOB_TYPES: {
        SCENE_CENTER: "scene_center",
        SCENE_LEFT: "scene",
        SCENE_RIGHT: "scene_right",
        TITLE: "title",
        SUBTITLE: "subtitle",
        DIALOG_LEFT: "dialog",
        DIALOG_RIGHT: "dialog_right",
        HIDDEN: "hidden",
        CONTAINER: "container"
    },
    SCHEMAS: {
        SCENE: {
            DESC: "desc",
            TYPE: "type",
            ACTIONS: "actions",
            PORTRAIT: "portrait",
            PRE_EXEC: "pre_exec",
            POST_EXEC: "post_exec",
            GOTO: "goto"
        },
        ACTION: {
            NAME: "name",
            ICON: "icon",
            DESC: "desc",
            EXEC: "exec",
            TYPE: "type",
            GOTO: "goto" ,
            PORTRAIT: "portrait",
            TAG: "tag",
            CONDITION: "condition"
        },
        ICON: {
            IMG: "img",
            TEXT: "text",
            CLASS: "class",
            STYLE: "style",
            ATTRS: "attrs"
        },
        EVENT_HANDLER: {
            TAG: 'tag',
            CALLBACK: 'callback',
            USE_LIMIT: 'use_limit',
            DISABLE_ON_LIMIT: 'disableOnLimit',
        },
    },
    SCREENS: {
        TYPES: {
            SIMPLE_MENU: 'simpleMenu',
            SIMPLE_TEXT: 'simpleText'
        }
    },
    HTML: {
        TEMPLATES: {
            FULL: '<{tag} {attrs}>{content}</{tag}>',
            SHORT: '<{tag} {attrs} />',
            LABEL: '<label {attrs}>{content}</label>'
        },
        TAGS: {
            IMAGE: "img",
            VIDEO: "video",
            LABEL: "label",
            CLICK: "button",
            INPUT: "input",
            SELECT: "select",
            METER: "meter",
            OPTION: "option",
            GROUP: "group",
            ORDERED_LIST: "ol",
            LIST: "ul",
            LIST_ENTRY: "li"
        },
        MENU: {
            ICON_CLS: 'menu-button-icon'
        },
        ACTION: {
            ICON_CLS: 'action-btn-icon'
        }
    },
    // ---
    OPERATIONS: {
        OVERRIDE: 0,
        APPEND: 1
    },
    ALIGN: {
        LEFT: 'left',
        RIGHT: 'right',
    },
    LOG_LEVELS: {
        ERROR: 0,
        WARNING: 1,
        INFO: 2,
        DEBUG: 3
    }
}

JSPG.Maps = {
    BLOB_STYLE_BY_TYPE: {},
    BLOB_TYPE_BY_TOKEN: {},
    SCREEN_TEMPLATE_BY_TOKEN: {},
}

{
    // Blob Type to Style mapping
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .SCENE_CENTER] =  JSPG.Constants.BLOB_STYLES.SCENE_CENTER;
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .SCENE_LEFT] =  JSPG.Constants.BLOB_STYLES.SCENE_LEFT;
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .SCENE_RIGHT] =  JSPG.Constants.BLOB_STYLES.SCENE_RIGHT;
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .TITLE] =  JSPG.Constants.BLOB_STYLES.TITLE;
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .SUBTITLE] =  JSPG.Constants.BLOB_STYLES.SUBTITLE;
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .DIALOG_LEFT] =  JSPG.Constants.BLOB_STYLES.DIALOG_LEFT;
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .DIALOG_RIGHT] =  JSPG.Constants.BLOB_STYLES.DIALOG_RIGHT;
     JSPG.Maps.BLOB_STYLE_BY_TYPE [ JSPG.Constants.BLOB_TYPES .CONTAINER] =  JSPG.Constants.BLOB_STYLES.CONTAINER;
}

{
    // Inline Token to Blob type mapping
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .SCENE_CENTER] =  JSPG.Constants.BLOB_TYPES.SCENE_CENTER;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .SCENE_LEFT] =  JSPG.Constants.BLOB_TYPES.SCENE_LEFT;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .SCENE_RIGHT] =  JSPG.Constants.BLOB_TYPES.SCENE_RIGHT;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .TITLE] =  JSPG.Constants.BLOB_TYPES.TITLE;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .SUBTITLE] =  JSPG.Constants.BLOB_TYPES.SUBTITLE;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .DIALOG_LEFT] =  JSPG.Constants.BLOB_TYPES.DIALOG_LEFT;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .DIALOG_RIGHT] =  JSPG.Constants.BLOB_TYPES.DIALOG_RIGHT;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .CONTAINER] =  JSPG.Constants.BLOB_TYPES.CONTAINER;
     JSPG.Maps.BLOB_TYPE_BY_TOKEN [ JSPG.Constants.INLINE_TOKENS_TYPES .HIDDEN] =  JSPG.Constants.BLOB_TYPES.HIDDEN;
}

JSPG.Logging = {
    SCENE_HANDLER: {id: 'SceneHandler', level: JSPG.Constants.LOG_LEVELS.INFO},
    ACTION_HANDLER: {id: 'ActionHandler', level: JSPG.Constants.LOG_LEVELS.INFO},
    ELEMENTS_HANDLER: {id: 'ElementsHandler', level: JSPG.Constants.LOG_LEVELS.DEBUG},
    MENU_HANDLER: {id: 'MenuHandler', level: JSPG.Constants.LOG_LEVELS.INFO},
    PERSISTENCE: {id: 'Persistence', level: JSPG.Constants.LOG_LEVELS.INFO},
    BLOB_BUILDER: {id: 'BlobBuilder', level: JSPG.Constants.LOG_LEVELS.DEBUG},
    ENTITIES: {
        SCENE: {id: 'Scene-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        ACTION: {id: 'Action-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        BLOB: {id: 'Blob-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        ICON: {id: 'Icon-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        ELEMENT: {id: 'Element-$id', level: JSPG.Constants.LOG_LEVELS.INFO},
        LABELED_ELEMENT: {id: 'LabeledElement-$id', level: JSPG.Constants.LOG_LEVELS.INFO},
        ELEMENTS_GROUP: {id: 'ElementGroup-$id', level: JSPG.Constants.LOG_LEVELS.INFO},
        SCREEN: {id: 'Screen-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        EVENT_HANDLER: {id: 'EventHandler', level: JSPG.Constants.LOG_LEVELS.WARNING},
        ATTRIBUTES: {id: 'Attributes', level: JSPG.Constants.LOG_LEVELS.WARNING},
    }
}

// === Shared Functions ===
JSPG['execCode'] = function (code, ...params) {
    if (typeof(code) != typeof("")) return code(...params)
    if (code != "") return eval(code)
    return
}

JSPG['parseParamValue'] = function (paramValue) {
    // Checks param value data type and in case of function
    // executes and return result to context
    if (typeof paramValue === 'function') {
        return paramValue()
    }

    // Otherwise consider as a string
    return paramValue
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
    if (selfNormalization) objTarget = objSource

    for (const key in objSource) {
        const propCallback = Object.keys(callbackForProps).find(el => el.toLowerCase() == key.toLowerCase())
        let value = objSource[key]
        if (propCallback) {
            const bindedCallback = callbackForProps[propCallback].bind(objTarget)
            value = bindedCallback(value)
        }
        if (value == undefined) continue

        const normalizedPropName = propsToNormalize.find(el => el.toLowerCase() == key.toLowerCase())
        // No normalization needed - copy value as is or skip if self normaliztion routine
        if (!normalizedPropName) {
            if (selfNormalization) continue
            objTarget[key] = value
        }

        objTarget[normalizedPropName] = value
        if (!selfNormalization || key == normalizedPropName) continue

        // Delete non-normalized key if in self normalization routine
        delete objTarget[key]
    }
}

JSPG['getByNormalizedKey'] = function (obj, normalizedKey, orDefault=null) {
    const key = Object.keys(obj).find(key => key.toLowerCase() == normalizedKey)
    if (!key) return orDefault
    return obj[key]
}

JSPG['scrollTo'] = function (uid) {
    const elementsByUID = $(`div[uid="${uid}"]`)
    if (elementsByUID.length == 0) {
        throw new Error(`[JSPG.ScrollTo] Failed to find element with uid=[${uid}].`);
    }
    elementsByUID[0].scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
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

// Entities objects
JSPG.Entities.Scene = function (id, name) {
    this.id = id
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
}

JSPG.Entities.Action = function () {
    this.id = JSPG.uid()
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
}

JSPG.Entities.Blob = function (content, portrait_html, style) {
    this.id = JSPG.uid()
    this.html = `<div class="scene-description ${style}" uid="${this.id}">${portrait_html}${content}</div>`
}

JSPG.Entities.Icon = function (iconCfg) {
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
}

JSPG.Entities.Element = function (tag) {
    // HTML element object.
    // Should be registered by JSPG.ElementsHandler.RegisterElement(element) for proper handling.
    
    this.id = JSPG.uid()
    this.tag = tag
    this.content = ''
    
    this.html_tag = ''
    this.html_template = ''
    
    this.attrs = new JSPG.Entities.Attributes({
        uid: this.id,
        tag: this.tag
    })
    this.eventHandler = new JSPG.Entities.EventHandler()
    
    this.element = null
    this.log = new Logger(
        JSPG.Logging.ENTITIES.ELEMENT.id.replace('$id', this.id),
        JSPG.Logging.ENTITIES.ELEMENT.level
    )
    
    // Constructor functions
    this.AsLabel = function (text) {
        this.html_tag = JSPG.Constants.HTML.TAGS.LABEL
        this.html_template = JSPG.Constants.HTML.TEMPLATES.FULL
        this.content = text
    
        this.finalize()
        return this
    }
    
    this.AsImage = function (src) {
        this.html_tag = JSPG.Constants.HTML.TAGS.IMAGE
        this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
        this.attrs.modify('src', src)
    
        this.finalize()
        return this
    }
    
    this.AsVideo = function (src, autoplay=true, loop=true, muted=false, controls=false) {
        this.html_tag = JSPG.Constants.HTML.TAGS.VIDEO
        this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
        this.attrs.modify({
            src: src,
            autoplay: autoplay ? '+' : null,
            loop: loop ? '+' : null,
            muted: muted ? '+' : null,
            controls: controls ? '+' : null
        })
        this.finalize()
        return this
    }
    
    this.AsClick = function (text) {
        this.html_tag = JSPG.Constants.HTML.TAGS.CLICK
        this.html_template = JSPG.Constants.HTML.TEMPLATES.FULL
        this.content = text
        this.finalize()
        return this
    }
    
    this.AsInput = function (defaultValue, placeholderText) {
        this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
        this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
        this.attrs.modify({
            type: 'text',
            value: defaultValue,
            placeholder: placeholderText
        })
        this.finalize()
        return this
    }
    
    this.AsOption = function (label, value, selected=false) {
        this.html_tag = JSPG.Constants.HTML.TAGS.OPTION
        this.html_template = JSPG.Constants.HTML.TEMPLATES.FULL
        this.content = label
        this.attrs.modify({
            value: value,
            selected: selected ? 'true' : null
        })
    
        this.finalize()
        return this
    }
    
    this.AsCustom = function (html_tag, isFullForm=true, content='') {
        this.html_tag = html_tag
        this.html_template = isFullForm
                             ? JSPG.Constants.HTML.TEMPLATES.FULL
                             : JSPG.Constants.HTML.TEMPLATES.SHORT
        this.content = content
        this.finalize()
    
        return this
    }
    
    // Public functions
    this.Get = function () {
        // Returns HTML code of the element
        const html = this.html_template.format({
            tag: this.html_tag,
            attrs: this.attrs.compose(),
            content: this.content
        })
        this.log.debug('{Get}', html)
        return html
    }
    
    this.Value = function () {
        if (!this.element) return
        return this.element.value
    }
    
    this.Enable = function () {
        // Assigns eventhandler to HTML node in document
        const element = this.findInDOM()
        if (!element) return
    
        element.disabled = false
        this.eventHandler.apply(element, this)
    
        if (this.html_tag === JSPG.Constants.HTML.TAGS.VIDEO && this.attrs.get('autoplay')) {
            //this.element.load()
            this.element.play()
        }
    }
    
    this.Disable = function () {
        // Removes eventhandler from HTML node in document
        this.eventHandler.clear(this.element)
    
        if (this.element) {
            this.element.disabled = true
    
            if (this.html_tag === JSPG.Constants.HTML.TAGS.VIDEO) {
                this.element.pause()
            }
        }
        this.log.info('{Disable}', `Element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
    }
    
    this.AddEventHandler = function (eventName, callback, tag, use_limit, mark_disabled) {
        this.eventHandler.add(eventName, callback, tag, use_limit, mark_disabled)
    }
    
    this.RemoveEventHandler = function (eventName, tag) {
        // Looks for Event listeners in element's event handler list
        // and removes it from both list and html node
        this.eventHandler.remove(this.element, eventName, tag)
    }
    
    // Private
    this.findInDOM = function () {
        if (!this.element) {
            const $node = $(`${this.html_tag}[uid=${this.id}]`)
            if ($node.length > 0) this.element = $node[0]
        }
    
        return this.element
    }
    
    this.toString = function () {
        return `[Element <${this.html_tag}>/tag=${this.tag}, id=${this.id}/]`
    }
    
    this.finalize = function () {
        delete this['AsLabel']
        delete this['AsImage']
        delete this['AsVideo']
        delete this['AsClick']
        delete this['AsInput']
        delete this['AsOption']
        delete this['AsCustom']
        delete this['finalize']
    }
}

JSPG.Entities.LabeledElement = function (tag=null, label='', align='left') {
    // Constructor of HTML element with label (e.g. checkbox, radio, slider or meter)
    // Should be registered by JSPG.ElementsHandler.RegisterElement(element) for proper handling.
    
    this.id = JSPG.uid()
    this.tag = tag
    this.labelContent = label
    this.align = align.toLowerCase()
    
    this.html_tag = ''
    this.html_template = ''
    this.isCheckable = false
    
    this.attrs = new JSPG.Entities.Attributes({
        tag: this.tag,
        uid: this.id
    })
    this.labelAttrs = new JSPG.Entities.Attributes({
        tag: `${this.tag}-label`,
        uid: `${this.id}-label`
    })
    this.eventHandler = new JSPG.Entities.EventHandler()
    
    this.element = null
    this.label = null
    this.log = new Logger(
        JSPG.Logging.ENTITIES.LABELED_ELEMENT.id.replace('$id', this.id),
        JSPG.Logging.ENTITIES.LABELED_ELEMENT.level
    )
    
    // Constructor functions
    this.AsCheckbox = function (isChecked=false, value='', name='') {
        this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
        this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
        this.attrs.modify({
            type: 'checkbox',
            checked: isChecked ? '+' : null,
            value: value,
            name: name,
        })
        this.isCheckable = true
        this.attachLabel(`checkbox-${this.id}`)
        this.finalize()
    
        return this
    }
    
    this.AsRadio = function (isSelected=false, value='', name='') {
        this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
        this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
        this.attrs.modify({
            type: 'radio',
            checked: isSelected ? '+' : null,
            value: value ? value : this.labelContent,
            name: name
        })
    
        this.isCheckable = true
        this.attachLabel(`radio-${this.id}`)
        this.finalize()
    
        return this
    }
    
    this.AsSlider = function (min=0, max=10, value=5, step=1, name='',
        labelUpdateCallback=(element,value)=>element.SetLabel(value),
        callbackTag='default'
    ) {
        this.html_tag = JSPG.Constants.HTML.TAGS.INPUT
        this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
        this.attrs.modify({
            type: 'range',
            name: name,
            min: min,
            max: max,
            value: value,
            step: step
        })
        if (labelUpdateCallback) {
            this.labelUpdateCallback = labelUpdateCallback
            this.AddEventHandler(
                'input.inbuilt',
                (element, event) => labelUpdateCallback(element, event.target.value),
                callbackTag
            )
        }
        this.attachLabel(`range-${this.id}`)
        this.finalize()
    
        return this
    }
    
    this.AsMeter = function (min=0, max=10, value=5, low=0, high=10, optimum=5) {
        this.html_tag = JSPG.Constants.HTML.TAGS.METER
        this.html_template = JSPG.Constants.HTML.TEMPLATES.SHORT
        this.attrs.modify({
            min: min,
            max: max,
            value: value,
            low: low,
            high: high,
            optimum: optimum,
        })
        this.attachLabel(`meter-${this.id}`)
        this.finalize()
    
        return this
    }
    
    // Publis function
    this.Get = function () {
        // Returns HTML code of 2 elements - element and it's label
        const elementHtml = this.html_template.format({
            tag: this.html_tag,
            attrs: this.attrs.compose()
        })
        const labelHtml = JSPG.Constants.HTML.TEMPLATES.LABEL.format({
            attrs: this.labelAttrs.compose(),
            content: this.labelContent
        })
        const html = align == JSPG.Constants.ALIGN.RIGHT
                     ? `${labelHtml}${elementHtml}`
                     : `${elementHtml}${labelHtml}`
    
        this.log.debug('{Get}', html)
        return html
    }
    
    this.Value = function () {
        if (!this.element) return
    
        return this.element.value
    }
    
    this.Enable = function () {
        // Assigns eventhandler to HTML node in document
        const element = this.findInDOM()
        if (!element) return
    
        element.disabled = false
        this.eventHandler.apply(element, this)
    
        if (this.attrs.get('type') && this.attrs.get('type') === 'range') {
            this.labelUpdateCallback(this, this.Value())
        }
        if (this.html_tag === JSPG.Constants.HTML.TAGS.METER) {
            this.SetLabel(this.Value())
        }
    }
    
    this.Disable = function () {
        this.eventHandler.clear(this.element)
    
        if (this.element) this.element.disabled = true
        this.log.info('{Disable}', `Element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
    }
    
    this.AddEventHandler = function (eventName, callback, tag, use_limit, mark_disabled) {
        this.eventHandler.add(eventName, callback, tag, use_limit, mark_disabled)
    }
    
    this.RemoveEventHandler = function (eventName, tag) {
        // Looks for Event listeners in element's event handler list
        // and removes it from both list and html node
        this.eventHandler.remove(this.element, eventName, tag)
    }
    
    this.SetLabel = function (text) {
        this.labelContent = text
        if (!this.label) return
        this.label.innerHTML = text
    }
    
    // -----------------------------------------
    this.attachLabel = function(attachToID) {
        this.attrs.modify('id', attachToID)
        this.labelAttrs.modify({
            id: `label-for-${attachToID}`,
            for: attachToID,
        })
    }
    
    this.findInDOM = function () {
        if (!this.element) {
            const $node = $(`${this.html_tag}[uid=${this.id}]`)
            if ($node.length > 0) this.element = $node[0]
    
            const $labelNode = $(`label[uid=${this.id}-label]`)
            if ($labelNode.length > 0) this.label = $labelNode[0]
        }
    
        return this.element
    }
    
    this.toString = function () {
        return `[Labeled Element <${this.html_tag}>/tag=${this.tag}, id=${this.id}, label=${this.labelContent}/]`
    }
    
    this.finalize = function () {
        delete this['AsCheckbox']
        delete this['AsRadio']
        delete this['AsSlider']
        delete this['AsMeter']
        delete this['attachLabel']
        delete this['finalize']
    }
}

JSPG.Entities.ElementsGroup = function (tag=null, align='left', joinWith='<br>') {
    this.id = JSPG.uid()
    this.tag = tag
    this.align = align
    this.joinWith = joinWith
    this.value = null
    
    this.html_tag = JSPG.Constants.HTML.TAGS.GROUP
    
    this.attrs = new JSPG.Entities.Attributes({uid: this.id, tag: this.tag})
    this.eventHandler = new JSPG.Entities.EventHandler()
    
    this.nestedElements = []
    
    this.log = new Logger(
        JSPG.Logging.ENTITIES.ELEMENTS_GROUP.id.replace('$id', this.id),
        JSPG.Logging.ENTITIES.ELEMENTS_GROUP.level
    )
    
    // Constructor functions
    this.AsRadiobuttons = function (options, defaultIdx=0, values=null) {
        // Configure element to Radiobutton set
        const name = `radiobuttons-set-${this.id}`
        for (let idx = 0; idx < options.length; ++idx) {
            const tag = `${this.tag}-nested-${idx}`
            const label = options[idx]
            const value = values ? values[idx] : null
    
            const el = new JSPG.Entities
                           .LabeledElement(tag, label, this.align)
                           .AsRadio(/*isChecked*/ defaultIdx == idx, value, name)
    
            this.nestedElements.push(el)
        }
    
        this.Value = () => {
            for (const nel of this.nestedElements.values()) {
                if (nel.element.checked) return nel.Value()
            }
        }
    
        this.finalize()
        return this
    }
    
    this.AsOptions = function (options, defaultIdx=0, values=null) {
        this.html_tag = JSPG.Constants.HTML.TAGS.SELECT
        for (let idx = 0; idx < options.length; ++idx) {
            const tag = `${this.tag}-nested-${idx}`
            const label = options[idx]
            const value = values ? values[idx] : null
            const isSelected = defaultIdx == idx
    
            const el = new JSPG.Entities.Element(tag)
                           .AsOption(label, value, isSelected)
    
            this.nestedElements.push(el)
        }
    
        this.Value = () => {
            for (const nel of this.nestedElements.values()) {
                if (nel.element.selected) return nel.Value()
            }
        }
    
        this.finalize()
        return this
    }
    
    this.AsList = function (options, ordered=false) {
        this.html_tag = ordered
                        ? JSPG.Constants.HTML.TAGS.ORDERED_LIST
                        : JSPG.Constants.HTML.TAGS.LIST
        for (let idx = 0; idx < options.length; ++idx) {
            const el = new JSPG.Entities.Element()
                           .AsCustom(JSPG.Constants.HTML.TAGS.LIST_ENTRY, true, options[idx])
            this.nestedElements.push(el)
        }
        this.joinWith = ''
    
        this.finalize()
        return this
    }
    
    // Public
    this.Get = function () {
        // Compose element and its childs to HTML code
        const content = []
        for (let idx = 0; idx < this.nestedElements.length; ++idx) {
            content.push(this.nestedElements[idx].Get())
        }
        const html = `<${this.html_tag} ${this.attrs.compose()}>${content.join(this.joinWith)}</${this.html_tag}>`
    
        return html
    }
    
    this.Value = function () {
        // Returns value of elements group. Is overwritten in As... functions
        return null
    }
    
    this.Enable = function () {
        // Enables element and it's childs
        const element = this.findInDOM()
        if (!element) return
    
        element.disabled = false
        this.eventHandler.apply(element, this)
    
        for (let idx = 0; idx < this.nestedElements.length; ++idx) {
            this.nestedElements[idx].Enable()
        }
    }
    
    this.Disable = function () {
        // Disables element and it's childs, and removes all attached event listeners
        this.eventHandler.clear(this.element)
    
        if (!this.element) return
    
        for (let idx = 0; idx < this.nestedElements.length; ++idx) {
            this.nestedElements[idx].Disable()
        }
        this.element.disabled = true
        this.log.info('{Disable}', `Element group [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
    }
    
    this.AddEventHandler = function (eventName, callback, tag, useLimit, disableOnLimit) {
        // Adds event listener directly to element, but not childs
        this.eventHandler.add(...arguments)
    }
    
    this.RemoveEventHandler = function (eventName, tag) {
        // Removes event listener directly from element, but not childs
        this.eventHandler.remove(this.element, eventName, tag)
    }
    
    this.AddEventHandlerToNested = function (eventName, callback, tag, useLimit, disableOnLimit) {
        // Adds event listener to all childs, but not element itself
        for (let idx = 0; idx < this.nestedElements.length; ++idx) {
            this.nestedElements[idx].AddEventHandler(...arguments)
        }
    }
    
    this.RemoveEventHandlerFromNested = function (eventName, tag) {
        // Removes event listener from all childs, but not element itself
        for (let idx = 0; idx < this.nestedElements.length; ++idx) {
            this.nestedElements[idx].RemoveEventHandler(eventName, tag)
        }
    }
    
    this.Nested = function (index) {
        // Returns nested element by given tag or index
        if (index > this.nestedElements.size || index < 0) {
            this.log.error('{Nested}', 'Given nested index ${tag} is out of range (${this.nestedElements.size})!')
            return null
        }
    
        return this.nestedElements[index]
    }
    
    
    // Private
    this.findInDOM = function () {
        if (!this.element) {
            const $node = $(`${this.html_tag}[uid=${this.id}]`)
            if ($node.length > 0) this.element = $node[0]
        }
    
        return this.element
    }
    
    this.toString = function () {
        return `[Elements Group <${this.html_tag}>/tag=${this.tag}, id=${this.id}/ of ${this.nestedElements.length} items]`
    }
    
    this.finalize = function () {
        delete this['AsRadiobuttons']
        delete this['AsOptions']
        delete this['AsList']
        delete this['finalize']
    }
}

JSPG.Entities.Attributes = function (...params) {
    this.classlist = []
    this.stylelist = []
    this.attrs = {}
    this.log = new Logger(
        JSPG.Logging.ENTITIES.ATTRIBUTES.id,
        JSPG.Logging.ENTITIES.ATTRIBUTES.level,
    )
    
    this.modify = function () {
        /*  Use cases:
            attrs.modify('class', 'my-class', false)
            attrs.modify('src', 'myimg.jpg')
            attrs.modify({src: myimg.jpg, class: 'myclass'}, false)
        */
        if (arguments.length == 0) return
    
        let attrObj = null
        let override = true
    
        if (typeof arguments[0] == typeof "") {
            attrObj = {}
            attrObj[arguments[0]] = arguments[1]
            override = arguments[2] != undefined
                       ? arguments[2] == JSPG.Constants.OPERATIONS.OVERRIDE
                       : override
        } else {
            attrObj = arguments[0]
            override = arguments[1] != undefined
                       ? arguments[1] ==JSPG.Constants.OPERATIONS.OVERRIDE
                       : override
        }
    
        for (let key in attrObj) {
            this.log.info('{modify}', `${key} = ${attrObj[key]}`)
            const value = attrObj[key]
            key = key.toLowerCase()
            const listname = key == 'class'
                             ? 'classlist'
                             : (key == 'style' ? 'stylelist' : null)
    
            // Attribures deletion case
            if (value == null || value === '') {
                this.log.info('{modify}', 'Deletion of key')
                if (!override) continue
                if (listname != null) {
                    this[listname].purge()
                    continue
                }
    
                delete this.attrs[key]
                continue
            }
    
            // Attribute force add case
            if (override) {
                this.log.info('{modify}', 'Force add/override of key')
                if (listname != null) {
                    this[listname].purge()
                    this._composeList(listname, value)
                    continue
                }
    
                this.attrs[key] = value
                continue
            }
    
            // Append or create key-value if none
            this.log.info('{modify}', 'Add/append key')
            if (listname != null) {
                this._composeList(listname, value)
                continue
            }
            this.attrs[key] = this.attrs.hasOwnProperty(key)
                              ? `${this.attrs[key]} ${value}`
                              : value
        }
    }
    
    this.get = function(key) {
        key = key.toLowerCase()
        return (key == 'class') ? this.classlist.join(' ') : this.attrs[key]
    }
    
    this._composeList = function (listname, lineValue) {
        const delimeter = listname == 'classlist' ? ' ' : ';'
        const values = lineValue.split(delimeter)
        for (let i = 0; i < values.length; ++i) {
            this[listname].push(values[i])
        }
    }
    
    this.compose = function () {
        const attrList = []
        for (const k in this.attrs) {
            const val = this.attrs[k]
            if (val == '+') {
                attrList.push(k)
            } else {
                attrList.push(`${k}="${this.attrs[k]}"`)
            }
        }
        return `class="${this.classlist.join(" ")}" ${attrList.join(" ")} style="${this.stylelist.join(";")}"`
    }
    
    {
        this.modify(params[0])
    }
}

JSPG.Entities.EventHandler = function () {
    /* In format:
        eventName1: Map(
            tag1: HandlerObject(tag, ...handler),
            ...
        ),
        eventNae2: Map(...)
    */
    this.listeners = new Map()
    this.log = new Logger(
        JSPG.Logging.ENTITIES.EVENT_HANDLER.id,
        JSPG.Logging.ENTITIES.EVENT_HANDLER.level
    )
    
    this.add = function (eventName, callback, tag=null, use_limit=-1, mark_disabled=false) {
        const EHSTRUCT = JSPG.Constants.SCHEMAS.EVENT_HANDLER
        eventName = eventName.toLowerCase()
    
        if (eventName.split('.').length == 1) {
            eventName = `${eventName}.user_defined`
        }
    
        const handlersMap = this.listeners.has(eventName)
                            ? this.listeners.get(eventName)
                            : new Map()
    
        if (!tag) tag = JSPG.uid()
    
        const handler = {}
        handler[EHSTRUCT.TAG] = tag
        handler[EHSTRUCT.CALLBACK] = callback
        handler[EHSTRUCT.USE_LIMIT] = use_limit
        handler[EHSTRUCT.DISABLE_ON_LIMIT] = mark_disabled
    
        this.log.info('{add}', `Add for ${eventName}`)
        this.log.info('{add}', handler)
    
        handlersMap.set(tag, handler)
        this.listeners.set(eventName, handlersMap)
    }
    
    this.remove = function (DOMElement, eventName, tag=null) {
        // Looks for Event listeners in element's event handler list
        // and removes it from both list and html node
        eventName = eventName.toLowerCase()
        if (eventName.split('.').length == 1) {
            eventName = `${eventName}.user_defined`
        }
        if (!this.listeners.has(eventName)) return
    
        // If no tag given - remove all listeners for event name
        if (!tag) {
            this.listeners.delete(eventName)
            if (DOMElement) $(DOMElement).off(eventName)
            return
        }
    
        // Otherwise - search and remove tagged listener
        const handlersMap = this.listeners.get(eventName)
        if (!handlersMap.has(tag)) return null
    
        const handler = handlersMap.get(tag)
        DOMElement.removeEventListener(
            eventName,
            handler[JSPG.Constants.SCHEMAS.EVENT_HANDLER.CALLBACK]
        )
        handlersMap.delete(tag)
    }
    
    this.apply = function (DOMElement, elementRef) {
        // Applies eventListeners to DOM element
        $(DOMElement).off()
    
        for (const listener of this.listeners) {
            const eventName = listener[0]
            const handlersMap = listener[1]
    
            for (const handler of handlersMap.values()) {
                $(DOMElement).on(eventName, event => {
                    JSPG.ElementsHandler.runElementsEventHandler(
                        elementRef,
                        eventName,
                        handler,
                        event
                    )
                })
            }
        }
    }
    
    this.clear = function (DOMElement) {
        this.listeners.clear()
        $(DOMElement).off()
    }
}

JSPG.BlobBuilder = new (function () {
    this.log = new Logger(
        JSPG.Logging.BLOB_BUILDER.id,
        JSPG.Logging.BLOB_BUILDER.level
    )
    
    this.createBlobsFrom = function (entity) {
        const contentfullBlobs = []
        for (let i = 0; i < entity.desc.length; ++i) {
            const blob = this._createBlob(entity.type, entity.portrait, entity.desc[i])
            if (!blob) continue
    
            contentfullBlobs.push(blob)
        }
    
        return contentfullBlobs
    }
    
    this._createBlob = function (typeDefault, portraitDefault, content) {
        const parsed = this._parseContent(content)
        this.log.debug(parsed)
    
        const type = parsed.hasOwnProperty('type')
                     ? parsed.type
                     : typeDefault
        if (!parsed || type == JSPG.Constants.BLOB_TYPES.HIDDEN) return null
    
        const style = typeDefault
                      ? JSPG.Maps.BLOB_STYLE_BY_TYPE[type]
                      : JSPG.Constants.BLOB_STYLES.SCENE_LEFT
    
        const portrait = JSPG.parseParamValue(parsed.hasOwnProperty('portrait')
                         ? parsed.portrait
                         : portraitDefault)
    
        const portrait_html = portrait
                              && (
                                  type === JSPG.Constants.BLOB_TYPES.DIALOG_RIGHT
                                  || type === JSPG.Constants.BLOB_TYPES.DIALOG_LEFT
                              )
                              ? `<img src="${portrait}" />`
                              : ''
    
       return new JSPG.Entities.Blob(parsed.content, portrait_html, style)
    }
    
    this._parseContent = function (rawContent) {
        /* Returns object of format:
           {
              content: (string),            - parsed content
              type: (optional, string),     - type parsed out from inline token
              portrait: (optional, string)  - portrait parsed out from inline token
           }
         */
        this.log.info('{parseContent}', `Raw content: ${rawContent}`)
    
        if (rawContent === '') {
            this.log.debug('{parseContent}', `Line is empty. Skip.`)
            return null
         }
    
        let content = rawContent
        // Check for interpolation single or multistring
        if (rawContent.startsWith("`") && rawContent.endsWith("`")) {
            this.log.debug('{parseContent}', `Line is expression to evaluate`)
            content = eval(rawContent).trim()
        } else if (rawContent.startsWith(JSPG.Constants.INLINE_EXECUTE_TOKEN)) {
            this.log.debug('{parseContent}', `Line is multiline expression to evaluate`)
            const line = rawContent.substr(JSPG.Constants.INLINE_EXECUTE_TOKEN.length)
            content = eval('`{line}`'.format('line', line)).trim()
        }
    
        if (content === '') {
            this.log.debug('{parseContent}', `Parsed line is empty. Skip from render.`)
            return null
        }
        this.log.debug('{parseContent}', `Non empty line {${content}}`)
    
        const parsed = {
            content: content
        }
    
        // Check for inline tokens
        const tokens = content.split(JSPG.Constants.INLINE_TOKEN_SEPARATOR)
        this.log.debug('{parseContent}', `Checking for tokens. Tokenized to ${tokens.length} element(s)`)
        if (
            tokens.length == 1
            || !tokens[1] == JSPG.Constants.INLINE_TOKEN_SEPARATOR
        ) {
            this.log.debug('{parseContent}', `No tokens found.`)
            return parsed
        }
    
        const typeToken = tokens[0].toUpperCase()
        const inlineType = JSPG.Maps.BLOB_TYPE_BY_TOKEN[typeToken]
        this.log.debug('{parseContent}', `Prefix token: ${typeToken} of type ${inlineType}`)
    
        if (inlineType == undefined) {
            this.log.debug('{parseContent}', `Prefix token is unknown. Return untouched content`)
            return parsed
        }
    
        parsed.type = inlineType
        parsed.content = tokens.slice(1, tokens.length).join('')
        this.log.debug('{parseContent}', `Content: ${parsed.content.length} chars, type: ${parsed.type}`)
    
        // For dialog there may be extra token with image
        if (tokens.length < 3
            || (
                typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_LEFT
                && typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_RIGHT
            )
        ) {
            this.log.debug('{parseContent}', `Is not dialog or missing portrait token...`)
            return parsed
        }
    
        parsed.portrait = tokens[1]
        parsed.content = tokens.slice(2, tokens.length).join('')
    
        this.log.debug('{parseContent}', `Is dialog token with portrait: ${parsed.portrait}`)
        this.log.debug('{parseContent}', `Content: ${parsed.content.length} chars`)
        return parsed
    }
})()

// Screen Template objects
JSPG.ScreenTemplates.simpleMenu = function () {
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
    this.log = new Logger(
        JSPG.Logging.ENTITIES.SCREEN.id.replace('$id', this.type),
        JSPG.Logging.ENTITIES.SCREEN.level
    )
    
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
    
        if (!this.hasOwnProperty(this.FIELDS.PRE_EXEC)) return this
    
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
        for (let idx = 0; idx < this.content.length; ++idx) {
            const content = this.content[idx]
            this.log.debug('{Get}', `Content idx: ${idx}`)
    
            const onClickCode = []
            if (typeof content.onclick != 'undefined') {
                this.onClickHandlers[idx] = content.onclick
                onClickCode.push(`JSPG.MenuHandler.onScreenElementClick(${idx})`)
    
                this.log.debug('{Get}', 'OnClick code defined - setting on click handler')
            }
            if (typeof content.navigateto != 'undefined') {
                onClickCode.push(` JSPG.MenuHandler.ShowScreen(\"${content.navigateto}\") `)
                this.log.debug('{Get}', 'NavigateTo defined - adding destination')
            }
            this.log.debug('{Get}', 'On click code: ', onClickCode)
    
            this.onClickHandlers.push(content.onClick)
            html.push(`<a href='javascript:void(0)' onclick='${onClickCode.join(';')}'>${content.title}</a>`)
        }
        html.push(`</div>`)
        html.push(`<a href="javascript:void(0)" class="closebtn" onclick="JSPG.MenuHandler.HideScreen()">&times;</a>`)
    
        return html.join('')
    }
}

JSPG.ScreenTemplates.simpleText = function () {
    this.type = JSPG.Constants.SCREENS.TYPES.SIMPLE_TEXT
    this.title = ''
    this.content = []
    this.HEADER_CLASS = 'simple-menu-header'
    this.CONTENT_CLASS = 'simple-menu-content'
    this.FIELDS = {
        TITLE: 'title',
        CONTENT: 'content',
        PRE_EXEC: 'pre_exec'
    }
    this.log = new Logger(
        JSPG.Logging.ENTITIES.SCREEN.id.replace('$id', this.type),
        JSPG.Logging.ENTITIES.SCREEN.level
    )
    
    this.fromConfig = function (config) {
        JSPG.normalizeAndCopyToObject(config, this, Object.values(this.FIELDS))
        if (!this.hasOwnProperty(this.FIELDS.PRE_EXEC)) return this
    
        this.pre_exec(this)
        JSPG.normalizeAndCopyToObject(this, null, Object.values(this.FIELDS))
    }
    
    this.Get = function () {
        const html = []
        if (this.title != '') {
            html.push(`<div class='${this.HEADER_CLASS}'>${this.title}</div>`)
        }
    
        html.push(`<div class='${this.CONTENT_CLASS}'>`)
        for (let idx = 0; idx < this.content.length; ++idx) {
            html.push(`<p>${this.content[idx]}</p>`)
        }
        html.push(`</div>`)
        html.push(`<a href="javascript:void(0)" class="closebtn" onclick="JSPG.MenuHandler.HideScreen()">&times;</a>`)
    
        return html.join('')
    }
}

{
    // Screen config type to template mapping
     JSPG.Maps.SCREEN_TEMPLATE_BY_TOKEN [ JSPG.Constants.SCREENS.TYPES .SIMPLE_MENU] =  JSPG.ScreenTemplates.simpleMenu;
     JSPG.Maps.SCREEN_TEMPLATE_BY_TOKEN [ JSPG.Constants.SCREENS.TYPES .SIMPLE_TEXT] =  JSPG.ScreenTemplates.simpleText;
}

// Handler components
JSPG.SceneHandler = new (function () {
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
})()

JSPG.ActionHandler = new (function () {
    this.actions = []
    this.SELECTORS = {
        CONTAINER: '#actions',
        BUTTONS: '.action-btn',
        BUTTON_BY_ID: '.action-btn[uid={uid}]',
    }
    this.HTML = {
        BUTTON: '<div class="action-btn" uid={uid}></div>'
    }
    this.log = new Logger(
        JSPG.Logging.ACTION_HANDLER.id,
        JSPG.Logging.ACTION_HANDLER.level
    )
    
    
    this.onHotkeySelection = function (e) {
        if (!JSPG.Settings.allowHotkeyActionSelection) return
    
        // Track keys 0...9
        if (e.keyCode < 49
            || e.keyCode > (49 + JSPG.ActionHandler.actions.length - 1)
            || $("#overlay").width() > 0
            || $(document.activeElement).is('input, textarea')
        ) return
    
        const idx = e.keyCode - 49
        JSPG.ActionHandler.onActionSelected(JSPG.ActionHandler.actions[idx].id)
    }
    
    this.getActionById = function (id) {
        return this.actions.find(action => action.id === id)
    };
    
    this.clearActionList = function () {
        this.actions.purge()
    };
    
    this.showSceneActions = function (actions) {
        this.clearActionList();
    
        this.actions = actions
        this.log.info('{setSceneActions}', `Preparing ${actions.length} actions`)
    
        const $container = $(this.SELECTORS.CONTAINER)
        for (let idx = 0; idx < actions.length; ++idx) {
            const action = actions[idx]
            this.log.debug('{setSceneActions}', `Id: ${action.id}, Name: ${action.name}`);
    
            $container.append(this.HTML.BUTTON.format('uid', action.id))
            const $btn = $(this.SELECTORS.BUTTON_BY_ID.format('uid', action.id))
    
            const hotkeyIcon = (JSPG.Settings.allowHotkeyActionSelection && JSPG.Settings.showHotkeyActionDefaultIcons)
                               ? new JSPG.Entities.Icon({text: idx+1, class: 'action-btn-icon-hotkey'}).asActionIcon().get()
                               : ''
    
            const html = action.icon == null
                         ? `${hotkeyIcon}${action.name}`
                         : `${hotkeyIcon}${action.icon.get()}${action.name}`
            $btn.html(html)
            $btn.off()
            $btn.on("click", () => this.onActionSelected(action.id))
        }
    
        $container.css("min-height", $container.height() + "px");
    
        setTimeout(() => {
            $(this.SELECTORS.CONTAINER).css("opacity", 1)
        }, JSPG.Constants.TIMEOUTS.ACTION.SHOW_OPTIONS);
    };
    
    this.onActionSelected = function (actionId) {
        JSPG.ElementsHandler.disableElements()
        this.hideSceneActions()
        const action = this.getActionById(actionId)
    
        const execTimeout = this.executeAction(action)
        const drawTimeout = this.showActionDescription(action, execTimeout)
        this.executePostAction(action, drawTimeout)
    }
    
    this.executeAction = function (action) {
        const timeout = JSPG.Constants.TIMEOUTS.ACTION.BEFORE_EXECUTE
        if (!action.exec) return 0
    
        setTimeout(() => {
            // If action exec code returns False - GoTo will be ignored (e.g. action code invokes goTo)
            const execResult = action.exec(action)
            if (execResult != undefined && !execResult) {
                action.condition = false
                this.log.debug('{executeAction}', 'Skip action\'s GoTo')
                return
            }
        }, timeout);
    
        return (timeout + JSPG.Constants.TIMEOUTS.ACTION.AFTER_EXECUTE)
    }
    
    this.showActionDescription = function (action, offsetTimeout) {
        if (action.type == JSPG.Constants.BLOB_TYPES.HIDDEN) return offsetTimeout
    
        const contentfullBlobs = JSPG.BlobBuilder.createBlobsFrom(action)
        const frames = contentfullBlobs.length
        if (frames == 0) return offsetTimeout
    
        let timeout = offsetTimeout + JSPG.Constants.TIMEOUTS.ACTION.SHOW_ANSWER
        for (let frame = 0; frame < frames; ++frame) {
            timeout += JSPG.Constants.TIMEOUTS.SCENE.STEP * frame
    
            JSPG.SceneHandler.drawBlob(contentfullBlobs[frame], timeout, frame == 0)
        }
    
        return (timeout + JSPG.Constants.TIMEOUTS.ACTION.AFTER_ANSWER)
    }
    
    this.executePostAction = function (action, offsetTimeout) {
        if (!action.goto) return
    
        setTimeout(() => {
            if (!action.condition) {
                this.log.info('{executePostAction}', 'Action is unavailable. Skip GoTo.')
                return 0
            }
    
            this.log.debug('{executePostAction}', 'GoTo to be defined.')
            const targetScene = JSPG.parseParamValue(action.goto)
    
            this.log.debug('{executePostAction}', `GoTo for action: ${targetScene}`)
            JSPG.SceneHandler.goTo(targetScene)
        }, offsetTimeout)
    }
    
    this.hideSceneActions = function () {
        $(this.SELECTORS.CONTAINER).css("opacity", 0)
        $(this.SELECTORS.BUTTONS).off()
        $(this.SELECTORS.BUTTONS).remove()
    };
    
    // On constuct
    {
        if (JSPG.Settings.allowHotkeyActionSelection) {
            document.addEventListener('keyup', this.onHotkeySelection)
        }
    }
})()

JSPG.ElementsHandler = new (function () {
    // Handles dynamically created element during scene presentation and transitions
    this.elements = new Map()  // list of custom elements objects
    this.log = new Logger(
        JSPG.Logging.ELEMENTS_HANDLER.id,
        JSPG.Logging.ELEMENTS_HANDLER.level
    )
    
    this.RegisterElement = function (element) {
        const key = element.tag ? element.tag : `${element.html_tag}-${element.id}`
        this.log.debug(`Registering element ${element.toString()}`)
        if (this.elements.get(key)) {
            this.log.error(`There is an element with tag ${key} already! Given element won't be added: ${element.toString()}`)
            return
        }
        this.elements.set(key, element)
    }
    
    this.RegisterElements = function(...elements) {
        for (let idx = 0; idx < elements.length; ++idx) {
            this.RegisterElement(elements[idx])
        }
    }
    
    this.UnregisterElement = function (elementOrTag) {
        let key = ''
        if (typeof elementOrTag == typeof '') {
            key = elementOrTag
        } else {
            for (const items of this.elements) {
                if (items[1] == elementOrTag) {
                    key = items[0]
                    break
                }
            }
        }
    
        if (!this.elements.has(key)) return
        this.elements.delete(key)
    }
    
    this.FindByTag = function (tag) {
        return this.elements.get(tag)
    }
    
    // ------------------------------
    this.enableElements = function () {
        // Activates elements. Invoked on scene rendering.
        for (const element of this.elements.values()) {
            element.Enable()
        }
    }
    
    this.disableElements = function () {
        // Deactivats elements. Invoked on action selection.
        for (const element of this.elements.values()) {
            element.Disable()
        }
    }
    
    this.clearElementsList = function () {
        this.elements.clear()
    }
    
    this.runElementsEventHandler = function (element, eventName, handler, event) {
        const EHSTRUCT = JSPG.Constants.SCHEMAS.EVENT_HANDLER
        const handlerTag = handler[EHSTRUCT.TAG]
        const callback = handler[EHSTRUCT.CALLBACK]
        const use_limit = handler[EHSTRUCT.USE_LIMIT]
        const disableOnLimit = handler[EHSTRUCT.DISABLE_ON_LIMIT]
    
        this.log.info('{RunEventHandler}',
            `Running event handler for event [${eventName}/${handlerTag}] for element ${element.toString()}`)
        callback(element, event)
    
        if (use_limit == -1) return
    
        const new_limit = use_limit - 1
        handler[EHSTRUCT.USE_LIMIT] = new_limit
        if (new_limit > 0) return
    
        this.log.info('{RunEventHandler}',
            `Event handler reached its limit for [${eventName}/${handlerTag}] for element ${element.toString()}`)
    
        element.RemoveEventHandler(eventName, handlerTag)
        if (disableOnLimit) element.Disable()
    }
})()

JSPG.MenuHandler = new (function () {
    this.items = []
    this.currentScreen = null
    this.SELECTORS = {
        CONTAINER: "#menu",
        OVERLAY: "#overlay",
        BUTTON_BY_POS: "#menu button[posid={pos}]"
    }
    this.HTML = {
        BUTTON_POS_SUBCLS: 'menu-button-idx-{pos}',
        BUTTON_CLS: 'menu-button menu-button-idx-{pos}',
        BUTTON: '<button {attrs}>{icon}{title}</button>'
    }
    this.log = new Logger(
        JSPG.Logging.MENU_HANDLER.id,
        JSPG.Logging.MENU_HANDLER.level
    )
    
    this.Constants = {
        CSS_BASE_CLASS: 'menu-button',
        CSS_IDX_CLASS_PREFIX: 'menu-button-idx-'
    }
    
    this.Button = function (tag, positionIdx, title, icon, onClick, style=null, attrs=null) {
        this.positionIdx = positionIdx
        this.tag = tag
        this.title = title
        this.icon = icon
        this.onClick = onClick
        this.attrs = new JSPG.Entities.Attributes(attrs)
        
        this.get = function () {
            const iconElement = this.icon == null ? '' : this.icon.get()
            const html = JSPG.MenuHandler.HTML.BUTTON.format({
                attrs: this.attrs.compose(),
                icon: iconElement,
                title: this.title
            })
            return html
        }
    
        this.find = function () {
            return $(JSPG.MenuHandler.SELECTORS.BUTTON_BY_POS.format('pos', this.positionIdx))
        }
    
        this.updatePositionIdx = function (newPositionIdx) {
            const $element = this.find()
            $element.attr({posid: newPositionIdx})
            $element.removeClass(JSPG.MenuHandler.HTML.BUTTON_POS_SUBCLS.format('pos', this.positionIdx))
            $element.addClass(JSPG.MenuHandler.HTML.BUTTON_POS_SUBCLS.format('pos', this.positionIdx))
    
            this.positionIdx = newPositionIdx
        }
    
        this.enable = function () { this.find().attr('disabled', false) }
        this.disable = function () { this.find().attr('disabled', true) }
    
        {
            this.attrs.modify({
                class: JSPG.MenuHandler.HTML.BUTTON_CLS.format('pos', positionIdx),
                tag: tag,
                style: style,
                onclick: "JSPG.MenuHandler.OnMenuItemClick(this)",
                posid: positionIdx,
            }, JSPG.Constants.OPERATIONS.APPEND)
        }
    }
    
    // Public-like
    this.AddMenuItem = function (tag, title, iconData, onclick, style=null, attrs=null) {
        const icon = iconData == null
                     ? null
                     : (new JSPG.Entities.Icon(iconData)).asMenuItemIcon()
        const item = new this.Button(
                        tag, positionIdx=this.items.length,
                        title, icon,
                        onclick,
                        style, attrs)
        this.items.push(item)
        const html = item.get()
        $(this.SELECTORS.CONTAINER).append(html)
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
        for (let idx = 0; idx < this.items.length; ++idx) {
            $btn = this.items[idx].find()
            $btn.remove()
        }
        this.items.purge()
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
    
    this.GetCurrentScreen = function () {
        return this.currentScreen;
    }
    
    this.ShowScreen = function (screenName) {
        const screenConfig = JSPG.Screens[screenName]
        const typeKey = Object.keys(screenConfig).find(key => key.toLowerCase() == 'type')
        if (!typeKey) {
            this.log.err(`ERROR on attempt to create unknown screen`)
            return
        }
    
        const screenTemplate = JSPG.Maps.SCREEN_TEMPLATE_BY_TOKEN[screenConfig[typeKey]]
        if (!screenTemplate) {
            this.log.err(`ERROR on attempt to create screen of unknown type [{screenConfig[typeKey]}]`)
            return
        }
        
        const screen = new screenTemplate()
        screen.fromConfig(screenConfig)
    
        this.currentScreen = screen
        this.UpdateScreenContent()
    
        $(this.SELECTORS.OVERLAY).width("100%")
    }
    
    this.UpdateScreenContent = function (html) {
        // Replace screen content with given HTML or by screen's Get() method
        if (html != undefined) {
            $(this.SELECTORS.OVERLAY).html(html)
        }
        if (this.currentScreen == null) return
        $(this.SELECTORS.OVERLAY).html(this.currentScreen.Get())
    }
    
    this.HideScreen = function () {
        $(this.SELECTORS.OVERLAY).width("0%")
        this.currentScreen = null
        this.UpdateScreenContent(html='')
    }
    
    // Not for public use
    this.OnMenuItemClick = function (btn) {
        const posid = btn.getAttribute('posid')
        this.log.info('{OnMenuItemClick}', `Clicked item ${btn} with posId=${posid}`)
    
        return this.items[posid].onClick()
    }
    
    
    this.AddMainMenuButton = function () {
        this.AddMenuItem(tag='main-menu-button',
                         title='Menu',
                         iconData=null,
                         onClick=() => { this.ShowScreen('Main') },
                         null,
                         {class: 'menu-button-main'})
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
        this.log.info('{onScreenElementClick}', `Handler id = ${eventHandlerIdx}`)
        const handler = this.currentScreen.onClickHandlers[eventHandlerIdx]
        if (handler == undefined) return
    
        this.log.info('{onScreenElementClick}', 'Invoking event handler for click')
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
            type: JSPG.Constants.SCREENS.TYPES.SIMPLE_TEXT,
            title: 'About',
            content: [
                `${JSPG.Meta.name}`,
                `by ${JSPG.Meta.author}`,
                `Version ${JSPG.Meta.version}`,
                `Game UID: ${JSPG.Meta.guid}`,
                '',
                `Powered by JSPG version ${JSPG.Meta.JSPGVersion}`
            ]
        }
    }
})()

JSPG.Persistence = new (function () {
    this.subscribers = []
    this.customSaveObject = null
    this.log = new Logger(
        JSPG.Logging.PERSISTENCE.id,
        JSPG.Logging.PERSISTENCE.level
    )
    
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
    
        JSPG.Settings.onBeforeGameSaved(this.customSaveObject)
    
        const meta = new this.Entity.Metadata()
        const data = new this.Entity.Save(this.customSaveObject)
        window.localStorage.setItem(target.meta, JSON.stringify(meta))
        window.localStorage.setItem(target.data, JSON.stringify(data))
    
        this.log.info('{Save}', `Game was saved to slot ${slot_id} -> [${target.data}]`)
    }
    
    this.Load = function (slot_id) {
        const target = this.getKeyBySlotId(slot_id)
        this.log.info('{Load}', `Game was loaded from slot ${slot_id} -> [${target.data}]`)
        const meta = window.localStorage.getItem(target.meta)
        const data = window.localStorage.getItem(target.data)
    
        if (!meta) return
    
        const parsedMeta = JSON.parse(meta)
        if (JSPG.Meta.version != parsedMeta.version) {
            console.log(`Saved game version mismatch! Current game version ${JSPG.Meta.version}, but saved game has ${parsedMeta.version}`)
            JSPG.Settings.onVersionMismatch(parsedMeta.version)
        }
    
        const parsedData = JSON.parse(data)
    
        this.subscribers.forEach(sub => {
            const name = sub[0]
            const obj = sub[1]
            const rules = sub[2]
    
            this.loadObject(obj, JSON.parse(parsedData.subscribers[name]), rules)
        })
    
        this.log.info('{Load}', `Loading scene ${parsedData.currentSceneName}`)
        JSPG.SceneHandler.clearOutput(`Game loaded (slot ${slot_id})`)
        JSPG.GoTo(parsedData.currentSceneName)
    
        this.log.debug('{Load}', `Executing onAfterGameLoaded`)
        JSPG.Settings.onAfterGameLoaded(parsedData.custom, this.customSaveObject)
        return parsedData.custom
    }
    
    this.Delete = function (slot_id) {
        const target = this.getKeyBySlotId(slot_id)
        window.localStorage.removeItem(target.meta)
        window.localStorage.removeItem(target.data)
        this.log.info('{Delete}', `Save file [${target.data}] was deleted!`)
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
            if (metaString != null) {
                const meta = JSON.parse(metaString)
                const date = new Date(meta.date)
                title = `Slot ${i + 1} -- ${date.toDateString()} ${date.toLocaleTimeString()} -- Game Version: ${meta.version}`
            }
    
            screen.content.push({title: title, onClick: onClick.bind(null, i)})
        }
    }
})()

JSPG.Helper = new (function () {
    // Simple elements
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
    
    // Labeled elements
    this.Checkbox = function (label, isChecked=false, align='left', tag='', style=null, klass=null, attrs=null) {
        const element = new JSPG.Entities.LabeledElement(label, tag, align)
                                         .AsCheckbox(isChecked)
        this._applyAttributesAndRegister(element, style, klass, attrs)
    
        return element.Get()
    }
    this.Slider = function (min, max, value, step, updateCallback, align, tag, style=null, klass=null, attrs=null) {
        const element = new JSPG.Entities.LabeledElement(tag, '', align)
                            .AsSlider(min, max, value, step, updateCallback)
        this._applyAttributesAndRegister(element, style, klass, attrs)
    
        return element.Get()
    }
    this.Meter = function (min, max, value, align, tag, style=null, klass=null, attrs=null) {
        const element = new JSPG.Entities.LabeledElement(tag, '', align)
                            .AsMeter(min, max, value, step, updateCallback)
        this._applyAttributesAndRegister(element, style, klass, attrs)
    
        return element.Get()
    }
    
    // Grouped elements
    this.Radio = function (options, selectedIdx, values, align, joinWith, tag, style=null, klass=null, attrs=null) {
        const element = new JSPG.Entities.ElementsGroup(tag, align, joinWith)
                            .AsRadiobuttons(options, selectedIdx, values)
        this._applyAttributesAndRegister(element, style, klass, attrs)
    
        return element.Get()
    }
    this.Options = function (options, selectedIdx, values, align, joinWith, tag, style=null, klass=null, attrs=null) {
        const element = new JSPG.Entities.ElementsGroup(tag, align, joinWith)
                            .AsOptions(options, selectedIdx, values)
        this._applyAttributesAndRegister(element, style, klass, attrs)
    
        return element.Get()
    }
    this.List = function (list, ordered, tag, style=null, klass=null, attrs=null) {
        const element = new JSPG.Entities.ElementsGroup(tag)
                            .AsList(list, ordered)
        this._applyAttributesAndRegister(element, style, klass, attrs)
    
        return element.Get()
    }
    
    this._applyAttributesAndRegister = function (elemnt, style, klass, attrs) {
        element.attrs.modify('class', klass)
        element.attrs.modify('style', style)
        element.attrs.modify('attrs', attrs, JSPG.Constants.OPERATIONS.APPEND)
        JSPG.ElementsHandler.RegisterElement(element)
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
})()

// === Before start ===
const $h = JSPG.Helper
const Scenes = {}
const Screens = {}

$( document ).ready(function() {
    JSPG.PlayScenario(scenes=Scenes, screens=Screens, init_scene='Init')
    JSPG.MenuHandler.AddMainMenuButton()
});

