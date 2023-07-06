
// === Before start ===
const $h = JSPG.Helper
const Scenes = {}
const Screens = {}

$( document ).ready(function() {
    JSPG.PlayScenario(scenes=Scenes, screens=Screens, init_scene=JSPG.Settings.initScene)
    JSPG.MenuHandler.AddMainMenuButton()
});
