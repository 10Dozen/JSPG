//@wrap:object:JSPG.Screens.MainMenu

type: JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU,
title: 'Main Menu',
pre_exec: (screen) => {
    if (JSPG.Settings.menu.mainMenuContent.saveLoad) {
        screen.content.push({title:'Save', navigateTo: 'SaveGameScreen'});
        screen.content.push({title:'Load', navigateTo: 'LoadGameScreen'});
    };

    if (JSPG.Settings.menu.mainMenuContent.about) {
        screen.content.push({title:'About', navigateTo: 'AboutScreen'});
    };

    if (JSPG.Debug.enable_debug_menu.jump_to_scene) {
        screen.content.push({
            title:'[DEBUG] Jump to Scene',
            navigateTo: 'Debug_JumpToSceneScreen'
        })
    }
}
