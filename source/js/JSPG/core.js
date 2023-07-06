const JSPG = {
    Meta: {
        name: 'Untitled',
        author: 'Unknown',
        version: '0.0.1',
        guid: '',
        JSPGVersion: '0.13.0'
    },
    Settings: {
        initScene: 'Init',
        menu: {
            addMainMenuButton: true,
            mainMenuContent: {
                saveLoad: true,
                about: true
            },
        },

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
    Screens: {},
    Debug: {},
}
