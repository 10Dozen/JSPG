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

    this.format = function (lvl, msg) {
        return [`[JSPG/${this.prefix}](${this.LOG_LEVEL_SUFFIX[lvl]})`, ...msg].join(' ')
    }

    this.isLogLevelAllowed = function (lvlToCheck) {
        return lvlToCheck <= this.level
    }

    this.err = function (...msg) {
        const lvl = this.LOG_LEVELS.ERROR
        if (!this.isLogLevelAllowed(lvl)) return
        console.error(this.format(lvl, msg))
    }

    this.warn = function (...msg) {
        const lvl = this.LOG_LEVELS.WARNING
        if (!this.isLogLevelAllowed(lvl)) return
        console.warn(this.format(lvl, msg))
    }

    this.info = function (...msg) {
        const lvl = this.LOG_LEVELS.INFO
        if (!this.isLogLevelAllowed(lvl)) return
        console.log(this.format(lvl, msg))
    }

    this.debug = function (...msg) {
        const lvl = this.LOG_LEVELS.DEBUG
        if (!this.isLogLevelAllowed(lvl)) return
        console.log(this.format(lvl, msg))
    }
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
        allowHotkeyActionSelection: true,
        showHotkeyActionDefaultIcons: true,
        onVersionMismatch: (savedVersion)=>{},  // function to run on load game when version mismatched
        onBeforeGameSaved: (customSaveObject) => {},
        onAfterGameLoaded: (loadedSaveObject, customSaveObject) => {}
    },
    Scenes: [],
    Screens: []
}
JSPG['Constants'] = {
    UID_SEQ: ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'],
    INLINE_TOKEN_SEPARATOR: '|',
    INLINE_TOKENS_TYPES: {
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
        SUBTITLE: "scene-subtitle",
        CONTAINER: "container"
    },
    BLOB_TYPES: {
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
        }
    },
    ELEMENTS: {
        IMAGE: "image",
        LABEL: "label",
        CLICK: "click",
        INPUT: "input",
        CHECKBOX: "checkbox",
        SELECT: "select",
        OPTIONS: "options",
        SLIDER: "slider",
        METER: "meter",
    },
    SCREENS: {
        TYPES: {
            SIMPLE_MENU: 'simple_menu',
            SIMPLE_TEXT: 'simple_text'
        }
    },
    HTML: {
        TEMPLATES: {
            FULL: '<{tag} {attrs}>{content}</{tag}>',
            SHORT: '<{tag} {attrs} />',
        },
        TAGS: {
            IMAGE: "img",
            LABEL: "label",
            CLICK: "button",
            INPUT: "input",
            CHECKBOX: "input",
            SELECT: "select",
            OPTIONS: "input",
            SLIDER: "input",
            METER: "meter",
        },
        MENU: {
            ICON_CLS: 'menu-button-icon'
        },
        ACTION: {
            ICON_CLS: 'action-btn-icon'
        }
    },
    OPERATIONS: {
        OVERRIDE: 0,
        APPEND: 1
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
    BLOB_TYPE_BY_TOKEN: {}
}
{
    // Blob Type to Style mapping
    JSPG.Maps.BLOB_STYLE_BY_TYPE[JSPG.Constants.BLOB_TYPES.SCENE_LEFT] = JSPG.Constants.BLOB_STYLES.SCENE_LEFT
    JSPG.Maps.BLOB_STYLE_BY_TYPE[JSPG.Constants.BLOB_TYPES.SCENE_RIGHT] = JSPG.Constants.BLOB_STYLES.SCENE_RIGHT
    JSPG.Maps.BLOB_STYLE_BY_TYPE[JSPG.Constants.BLOB_TYPES.TITLE] = JSPG.Constants.BLOB_STYLES.TITLE
    JSPG.Maps.BLOB_STYLE_BY_TYPE[JSPG.Constants.BLOB_TYPES.SUBTITLE] = JSPG.Constants.BLOB_STYLES.SUBTITLE
    JSPG.Maps.BLOB_STYLE_BY_TYPE[JSPG.Constants.BLOB_TYPES.DIALOG_LEFT] = JSPG.Constants.BLOB_STYLES.DIALOG_LEFT
    JSPG.Maps.BLOB_STYLE_BY_TYPE[JSPG.Constants.BLOB_TYPES.DIALOG_RIGHT] = JSPG.Constants.BLOB_STYLES.DIALOG_RIGHT
    JSPG.Maps.BLOB_STYLE_BY_TYPE[JSPG.Constants.BLOB_TYPES.CONTAINER] = JSPG.Constants.BLOB_STYLES.CONTAINER

    // Inline Token to Blob type mapping
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.SCENE_LEFT] = JSPG.Constants.BLOB_TYPES.SCENE_LEFT
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.SCENE_RIGHT] = JSPG.Constants.BLOB_TYPES.SCENE_RIGHT
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.TITLE] = JSPG.Constants.BLOB_TYPES.TITLE
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.SUBTITLE] = JSPG.Constants.BLOB_TYPES.SUBTITLE
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_LEFT] = JSPG.Constants.BLOB_TYPES.DIALOG_LEFT
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_RIGHT] = JSPG.Constants.BLOB_TYPES.DIALOG_RIGHT
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.HIDDEN] = JSPG.Constants.BLOB_TYPES.HIDDEN
    JSPG.Maps.BLOB_TYPE_BY_TOKEN[JSPG.Constants.INLINE_TOKENS_TYPES.CONTAINER] = JSPG.Constants.BLOB_TYPES.CONTAINER
}
JSPG.Logging = {
    SCENE_HANDLER: {id: 'SceneHandler', level: JSPG.Constants.LOG_LEVELS.INFO},
    ACTION_HANDLER: {id: 'ActionHandler', level: JSPG.Constants.LOG_LEVELS.INFO},
    ELEMENTS_HANDLER: {id: 'ElementsHandler', level: JSPG.Constants.LOG_LEVELS.INFO},
    MENU_HANDLER: {id: 'MenuHandler', level: JSPG.Constants.LOG_LEVELS.INFO},
    PERSISTENCE: {id: 'Persistence', level: JSPG.Constants.LOG_LEVELS.INFO},
    ENTITIES: {
        SCENE: {id: 'Scene-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        ACTION: {id: 'Action-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        BLOB: {id: 'Blob-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        ICON: {id: 'Icon-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        ELEMENT: {id: 'Element-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
        SCREEN: {id: 'Screen-$id', level: JSPG.Constants.LOG_LEVELS.WARNING},
    }
}

// === Shared Functions ===
JSPG['execCode'] = function (code) {
    if (typeof(code) != typeof("")) return code()
    if (code != "") return eval(code)
    return
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

// === Entities and templates ===
JSPG['Entities'] = {}
JSPG['Entities']['Scene'] = function (id, name) {
    this.id = id
    this.name = name
    this.desc = []
    this.type = JSPG.Constants.BLOB_TYPES.SCENE_LEFT
    this.actions = []
    this.portrait = ''
    this.pre_exec = null
    this.post_exec = null
    this.goto = ''
    this.log = new Logger(
        JSPG.Logging.ENTITIES.SCENE.id.replace('$id', this.id),
        JSPG.Logging.ENTITIES.SCENE.level
    )

    this.fromConfig = function (sceneConfig) {
        this.log.info('{fromConfig}',
            `Generating new scene with type ${JSPG.getByNormalizedKey(sceneConfig, "type", this.type)}`)

        propCallbacks = {}
        propCallbacks[JSPG.Constants.SCHEMAS.SCENE.DESC] = desc => Array.isArray(desc) ? desc : [desc]
        propCallbacks[JSPG.Constants.SCHEMAS.SCENE.ACTIONS] = actions => this.setActions(actions)
        propCallbacks[JSPG.Constants.SCHEMAS.SCENE.TYPE] = type => type.toLowerCase()

        JSPG.normalizeAndCopyToObject(sceneConfig, this,
                                      Object.values(JSPG.Constants.SCHEMAS.SCENE),
                                      propCallbacks)

        if (!Object.values(JSPG.Constants.BLOB_TYPES).includes(this.type)) {
            this.log.err('{fromConfig}', `Unknown scene type ${this.type}!`)
        }
    }

    this.parseDescriptions = function () {
        const contentfullBlobs = []
        for (let i = 0; i < this.desc.length; ++i) {
            const blob = new JSPG.Entities.Blob(this.type, this.portrait, this.desc[i])
            if (blob.html === '') continue
            contentfullBlobs.push(blob)
        }

        return contentfullBlobs
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
JSPG['Entities']['Action'] = function () {
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
};
JSPG['Entities']['Blob'] = function (typeDefault, portraitDefault, content) {
    this.id = JSPG.uid()
    this.type = typeDefault
    this.portrait = portraitDefault
    this.rawContent = content
    this.style = typeDefault == undefined ? JSPG.Constants.BLOB_STYLES.SCENE_LEFT : JSPG.Maps.BLOB_STYLE_BY_TYPE[typeDefault]
    this.content = ''
    this.html = ''
    this.log = new Logger(
        JSPG.Logging.ENTITIES.BLOB.id.replace('$id', this.id),
        JSPG.Logging.ENTITIES.BLOB.level
    )

    this.parseContent = function() {
        // Returns false if content is empty after parsing
        this.log.info('{parseContent}', `Raw content: ${this.rawContent}`)
        let content = this.rawContent

        // Check for interpolation single or multistring
        if (this.rawContent.startsWith("`") && this.rawContent.endsWith("`")) {
            this.log.debug('{parseContent}', `Line is expression to evaluate`)
            content = eval(this.rawContent).trim()
        }
        if (this.rawContent.startsWith(JSPG.Constants.INLINE_EXECUTE_TOKEN)) {
            this.log.debug('{parseContent}', `Line is multiline expression to evaluate`)
            let line = this.rawContent.substr(JSPG.Constants.INLINE_EXECUTE_TOKEN.length)
            content = eval('`{line}`'.format('line', line)).trim()
        }

        if (this.rawContent === '') {
            this.log.debug('{parseContent}', `Line is empty. Skip.`)
            return
        }

        this.content = content
        this.log.debug('{parseContent}', `Non empty line {${this.content}}`)

        const tokens = content.split(JSPG.Constants.INLINE_TOKEN_SEPARATOR)
        this.log.debug('{parseContent}', `Checking for tokens. Tokenized to ${tokens.length} elements`)
        if (tokens.length == 1
            || !tokens[1] == JSPG.Constants.INLINE_TOKEN_SEPARATOR
        ) {
            this.log.debug('{parseContent}', `No tokens found.`)
            return
        }

        const typeToken = tokens[0].toUpperCase()
        const inlineType = JSPG.Maps.BLOB_TYPE_BY_TOKEN[typeToken]
        this.log.debug('{parseContent}', `Prefix token: ${typeToken} of type ${inlineType}`)

        if (inlineType == undefined) {
            this.log.debug('{parseContent}', `Prefix token is unkonw. Return untouched content`)
            return
        }

        this.type = inlineType
        this.style = JSPG.Maps.BLOB_STYLE_BY_TYPE[inlineType]
        this.content = tokens.slice(1, tokens.length).join('')
        this.log.debug('{parseContent}', `Content: ${this.content} (style: ${this.style}, type: ${this.type})`)

        // For dialog there may be extra token with image
        if (tokens.length < 3
            || (
                typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_LEFT
                && typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_RIGHT
            )
        ) {
            this.log.debug('{parseContent}', `Is not dialog or missing portrait token...`)
            return
        }

        this.portrait = tokens[1]
        this.content = tokens.slice(2, tokens.length).join('')

        this.log.debug('{parseContent}', `Is dialog token with portrait: ${this.portrait}`)
        this.log.debug('{parseContent}', `Content: ${this.content}`)
    }

    {
        this.parseContent()
        this.log.debug('{formatHTML}', 'Blob after parsing:')
        this.log.debug('{formatHTML}', `  uid:      ${this.id}`)
        this.log.debug('{formatHTML}', `  Content:  ${this.content}`)
        this.log.debug('{formatHTML}', `  Type:     ${this.type}`)
        this.log.debug('{formatHTML}', `  Style:    ${this.style}`)
        this.log.debug('{formatHTML}', `  Portrait: ${this.portrait}`)

        if (this.content === '' || this.type == JSPG.Constants.BLOB_TYPES.HIDDEN) return

        let portrait_html = ''
        if (this.portrait != ''
            && (
                this.type == JSPG.Constants.BLOB_TYPES.DIALOG_LEFT
                || this.type == JSPG.Constants.BLOB_TYPES.DIALOG_RIGHT
            )
        ) {
            portrait_html = `<img src="${this.portrait}"/>`;
        }

        this.html = `<div class="scene-description ${this.style}" uid="${this.id}">${portrait_html}${this.content}</div>`
    }
}
JSPG['Entities']['Icon'] = function (iconCfg) {
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
        this.attrs = new JSPG.Types.Attributes(this.attrs)
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

    {
        this.fromConfig(iconCfg)
    }
}

/*
JSPG['Entities']['Element'] = function(tag=null) {
    this.id = JSPG.uid()
    this.tag = tag
    this.html_tag = ''
    this.template = ''
    this.content = ''
    this.eventHandlers = []
    this.attrs = new JSPG.Types.Attributes({uid: this.id, tag: tag})
    this.log = new Logger(
        JSPG.Logging.ENTITIES.ELEMENT.id.format('id', this.id),
        JSPG.Logging.ENTITIES.ELEMENT.level
    )

    this.Get = function() {
        const html = this.template.format({
            tag: this.html_tag,
            attrs: this.attrs.compose(),
            content: this.content
        })
        this.log.debug('{Get}', html)
        return html
    }

    this.SetTag = function(tag) {
        this.tag = tag
        this.attrs.modify('tag', tag)
        return this
    }

    this.SetEventHandlers = function (ehs) {
        this.eventHandlers = ehs
    }

    this.AddEventHandler = function (event, callback, use_limit=-1, mark_disabled=false) {
        this.eventHandlers.push([event, callback, use_limit, mark_disabled])
    }

    this._runEventHandlerByIndex = function (event, handlerIndex) {
        const eh = this.eventHandlers[handlerIndex]
        if (!eh) return

        const callback = eh[1]
        const use_limit = eh[2]
        const disableOnLimit = eh[3]

        this.log.info('{RunEventHandler}',
            `Running event [${event}] for element [${this.html_tag}/uid=${this.id} tag=${this.tag}]`)
        callback(event)

        if (use_limit == -1) return

        const new_limit = use_limit - 1
        eh[2] = new_limit
        if (new_limit > 0) return

        this.log.info('{RunEventHandler}',
            `Event handler reached its limit for event [${event}] for element [${this.html_tag}/uid=${this.id} tag=${this.tag}]`)

        this.RemoveEventHandler(event)
        if (disableOnLimit) this.Disable()
    }

    this.RemoveEventHandler = function (event) {
        const idx = this.eventHandlers.findIndex(eh=>eh[0]==event)
        if (idx < 0) return

        (this.Find()).off(event)
        this.eventHandlers.splice(idx,1)

        this.log.info('{RemoveEventHandler}',
            `Event handler [${event}] for element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was removed!`)

    }

    this.Find = function () {
        const $node = $(`${this.html_tag}[uid=${this.id}]`)
        if ($node.length == 0) return
        return $($node[0])
    }

    this.Disable = function() {
        this.eventHandlers.purge()

        const $node = this.Find()
        if (!$node) return

        $node.off()
        $node.prop('disabled', true)
        this.log.info('{Disable}',
            `Element [${this.html_tag}/uid=${this.id} tag=${this.tag}] was disabled`)
    }
}
JSPG['Entities']['ElementsGroup'] = function (tag=null) {
    this.id = JSPG.uid()
    this.tag = tag


}
*/

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
JSPG['Entities']['ScreenTemplates'][JSPG.Constants.SCREENS.TYPES.SIMPLE_TEXT] = function () {
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

JSPG['Types'] = {}
JSPG['Types']['Attributes'] = function (...params) {
    this.classlist = []
    this.stylelist = []
    this.attrs = {}

    // attrs.modify('class', 'my-class', false)
    // attrs.modify('src', 'myimg.jpg')
    // attrs.modify({src: myimg.jpg, class: 'myclass'}, false)
    this.modify = function () {
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
            //console.log(`${key} = ${attrObj[key]}`)
            const value = attrObj[key]
            key = key.toLowerCase()
            const listname = key == 'class'
                             ? 'classlist'
                             : (key == 'style' ? 'stylelist' : null)

            // Attribures deletion case
            if (value == null || value === '') {
                //console.log('Deletion route')
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
                //console.log('Force add/override route')
                if (listname != null) {
                    this[listname].purge()
                    this._composeList(listname, value)
                    continue
                }

                this.attrs[key] = value
                continue
            }

            // Append or create key-value if none
            //console.log('Add/append route')
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
            attrList.push(`${k}="${this.attrs[k]}"`)
        }
        return `class="${this.classlist.join(" ")}" ${attrList.join(" ")} style="${this.stylelist.join(";")}"`
    }

    {
        this.modify(params[0])
    }
}

// === Components Functions ===
JSPG['SceneHandler'] = new (function () {
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

    this.goTo = function (SceneName) {
        setTimeout(()=>{
            this.showScene(SceneName, JSPG.Scenes[SceneName])
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
        const contentfullBlobs = scene.parseDescriptions()
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

        if (this.currentScene.goto === '') return
        this.log.debug('{PostScene}', `[id:${this.currentSceneId}] GoTo navigation to ${this.currentScene.goto}`);
        this.goTo(this.currentScene.goto)
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
JSPG['ActionHandler'] = new (function () {
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
        if (e.keyCode < 49
            || e.keyCode > (49 + JSPG.ActionHandler.actions.length - 1)
            || $("#overlay").width() > 0
            || $(document.activeElement).is('input, textarea')
        ) return

        const idx = e.keyCode - 49
        console.log(`Action ${idx} selected!`)
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
        this.hideSceneActions()
        JSPG.ElementsHandler.clearElementsList()
        const action = this.getActionById(actionId)

        const drawTimeout = this.showActionDescription(action)
        this.executeAction(action, drawTimeout)
    }

    this.showActionDescription = function (action) {
        if (action.type == JSPG.Constants.BLOB_TYPES.HIDDEN) return
        const contentfullBlobs = action.parseDescriptions()
        const frames = contentfullBlobs.length
        if (frames == 0) return 0

        const baseTimeout = JSPG.Constants.TIMEOUTS.ACTION.SHOW_ANSWER
        let timeout = baseTimeout
        for (let frame = 0; frame < frames; ++frame) {
            timeout += JSPG.Constants.TIMEOUTS.SCENE.STEP * frame

            JSPG.SceneHandler.drawBlob(contentfullBlobs[frame], timeout, frame == 0)
        }

        return timeout
    }

    this.executeAction = function (action, drawTimeout) {
        setTimeout(() => {
            // If action exec code return False - GoTo will be ignored (e.g. action code invokes goTo)
            const execResult = JSPG.execCode(action.exec)
            if (
                (execResult != undefined && !execResult)
                || action.goto === ''
            ) {
                this.log.debug('{OnActionExecute}', 'Skip action\'s GoTo')
                return
            }

            this.log.debug('{OnActionExecute}', `GoTo: ${action.goto}`);
            JSPG.SceneHandler.goTo(action.goto)
        }, JSPG.Constants.TIMEOUTS.ACTION.EXECUTE + drawTimeout);
    }

    this.hideSceneActions = function () {
        $(this.SELECTORS.CONTAINER).css("opacity", 0)
        $(this.SELECTORS.BUTTONS).off()
        $(this.SELECTORS.BUTTONS).remove()
    };

    {
        if (JSPG.Settings.allowHotkeyActionSelection) {
            document.addEventListener('keyup', this.onHotkeySelection)
        }
    }
})()
JSPG['ElementsHandler'] = new (function () {
    this.elements = []  // list of custom elements objects
    this.log = new Logger(
        JSPG.Logging.ELEMENTS_HANDLER.id,
        JSPG.Logging.ELEMENTS_HANDLER.level
    )

    this.ELEMENTS_BY_TYPE = {}
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.LABEL] = '_asLabel'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.IMAGE] = '_asImage'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.CLICK] = '_asClick'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.INPUT] = '_asInput'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.CHECKBOX] = '_asCheckbox'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.SELECT] = '_asSelect'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.OPTIONS] = '_asOptions'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.SLIDER] = '_asSlider'
    this.ELEMENTS_BY_TYPE[JSPG.Constants.ELEMENTS.METER] = '_asMeter'

    this.enableElements = function () {
        // Activates element's event handlers. Invoked on scene rendering.
        for (let idx = 0; idx < this.elements.length; ++idx) {
            const element = this.elements[idx]
            const $node = element.Find()
            if ($node == undefined) return

            $node.off()
            for (let ehIdx = 0; ehIdx < element.eventHandlers.length; ++ehIdx) {
                const handlerName = element.eventHandlers[ehIdx][0]
                $node.on(handlerName, event => element._runEventHandlerByIndex(event, ehIdx))
            }
        }
    }

    this.clearElementsList = function () {
        for (let i = 0; i < this.elements.length; ++i) {
            this.elements[i].Disable()
        }
        this.elements.purge()
    }

    this.createElement = function (type, tag='', content='', style=null, attributes=null, eventsHandlers=[]) {
        this.log.info('{createElement}', `Type: ${type}, Content: ${content}`)
        const element = new JSPG.Entities.Element(tag)

        // Initialize element according to it's type
        this[this.ELEMENTS_BY_TYPE[type.toLowerCase()]](element, content)

        if (attributes != null) element.attrs.modify(attributes)
        if (style != null) element.attrs.modify('style', style, JSPG.Constants.OPERATIONS.APPEND)

        element.SetEventHandlers(eventsHandlers)

        this.elements.push(element)
        return element
    }

    this._asLabel = function (element, text) {
        element.html_tag = JSPG.Constants.HTML.TAGS.LABEL
        element.template = JSPG.Constants.HTML.TEMPLATES.FULL
        element.content = text
    }

    this._asImage = function (element, src) {
        element.html_tag = JSPG.Constants.HTML.TAGS.IMAGE
        element.template = JSPG.Constants.HTML.TEMPLATES.SHORT
        element.attrs.modify('src', src)
    }

    this._asClick = function (element, text) {
        element.html_tag = JSPG.Constants.HTML.TAGS.CLICK
        element.template = JSPG.Constants.HTML.TEMPLATES.FULL
        element.content = text
    }

    this._asInput = function (element, defaultValue) {
        element.html_tag = JSPG.Constants.HTML.TAGS.INPUT
        element.template = JSPG.Constants.HTML.TEMPLATES.SHORT
        element.attrs.modify({
            type: 'text',
            value: defaultValue
        })
    }

    this._asCheckbox = function (element, text) {
        /*
        element.html_tag = JSPG.Constants.HTML.TAGS.LABEL
        element.template = JSPG.Constants.HTML.TEMPLATES.FULL
        element.content = text
        */
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
JSPG['MenuHandler'] = new (function () {
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

    this.Entity = {
        Button: function (tag, positionIdx, title, icon, onClick, style=null, attrs=null) {
            this.positionIdx = positionIdx
            this.tag = tag
            this.title = title
            this.icon = icon
            this.onClick = onClick
            this.attrs = new JSPG.Types.Attributes(attrs)

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
    }

    // Protected-like
    this.AddMenuItem = function (tag, title, iconData, onclick, style=null, attrs=null) {
        const icon = iconData == null
                     ? null
                     : (new JSPG.Entities.Icon(iconData)).asMenuItemIcon()
        const item = new this.Entity.Button(
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

    this.OnMenuItemClick = function (btn) {
        const posid = btn.getAttribute('posid')
        this.log.info('{OnMenuItemClick}', `Clicked item ${btn} with posId=${posid}`)

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
JSPG['Persistence'] = new (function () {
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

JSPG['Helper'] =  new (function() {
    this.Click = function(text, callback, tag='', use_limit=1, style=null, attrs=null) {
        const element = JSPG.ElementsHandler.createElement(
            JSPG.Constants.ELEMENTS.CLICK,
            tag,
            text,
            style,
            attrs
        )
        element.AddEventHandler("click", callback, use_limit, true)
        element.attrs.modify('class', "inline-button")

        return element.Get()
    }
    this.Img = function(uri, tag='', style=null, attrs=null) {
        const element = JSPG.ElementsHandler.createElement(
            JSPG.Constants.ELEMENTS.IMAGE,
            tag,
            uri,
            style,
            attrs
        )
        return element.Get()
    }
    this.Label = function(text, tag='', style=null, attrs=null) {
        const element = JSPG.ElementsHandler.createElement(
            JSPG.Constants.ELEMENTS.LABEL,
            tag,
            text,
            style,
            attrs
        )
        return element.Get()
    }
    this.Input = function(defaultValue, tag='', placeholder=null, style=null, attrs=null) {
        const element = JSPG.ElementsHandler.createElement(
            JSPG.Constants.ELEMENTS.INPUT,
            tag,
            defaultValue,
            style,
            attrs
        )
        element.attrs.modify("placeholder", placeholder)
        return element.Get()
    }

    this.Find = {
        ByTag: function(tag) {
            return JSPG.ElementsHandler.findByTag(tag)
            // return $(`*[tag=${tag}]`)[0]
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


// === Start ===
const $h = JSPG.Helper
const Scenes = {}
const Screens = {}

JSPG.loadScript('src/js/Entities/Element.js', {})

$( document ).ready(function() {
    JSPG.PlayScenario(scenes=Scenes, screens=Screens, init_scene='Init')
    JSPG.MenuHandler.AddMainMenuButton()
});
