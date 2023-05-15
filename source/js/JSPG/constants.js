//@wrap:object:JSPG.Constants

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
