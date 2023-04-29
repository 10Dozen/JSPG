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
