//@wrap:object:JSPG.Screens.Debug_JumpToSceneScreen

type: JSPG.Constants.SCREENS.TYPES.SIMPLE_MENU,
title: 'Jump To Scene',
pre_exec: (screen)=>{
    for (const name in Scenes) {
        screen.content.push({
            title: name,
            onClick:  () => {
                JSPG.SceneHandler.clearOutput(`[DEBUG] Jumped to scene "${name}"`)
                JSPG.MenuHandler.HideScreen();
                JSPG.GoTo(name);
            }
        })
    }
}
