
// === Before start ===
const $h = JSPG.Helper
const Scenes = {}
const Screens = {}

$( document ).ready(function() {
    JSPG.PlayScenario(scenes=Scenes, screens=Screens, init_scene='Init')
    JSPG.MenuHandler.AddMainMenuButton()
});
