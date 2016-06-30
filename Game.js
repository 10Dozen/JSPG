/*
 *		"SceneName": {
 *			"desc": @SceneDescritpion(string) or [@SceneDescription1(string), @SceneDescription2(string)]
 *			,"actions": [
 *				[ 
 *					@ActionDisplayName(string) 
 *						OR [@ActionDisplayName(string), @ActionDescription(string)]
 *					, @NeedToShowAction(bool)
 *					, @CodeToExecute(string/jscode)
 *				]
 *			]
 *			, "exec": {
 *				"pre": 		@CodeToExecuteBeforeTheScene(string/jscode)
 *				, "post":	@CodeToExecuteAFterTheScene(string/jscode)
 *			}
 *		}
 *
 *
 */


var Scenes = {
	"InitScene": {
		"desc": "<img src='imgs/018.jpg'/>- You chose a wrong door, leather man. Leather club is two blocks down!"
		, "actions": [
			[ 
				[
					"- Fuck You!"
					, "You look in the face of the whitsnow and say:<br />- Fuck you!"
				]
				, true
				, "Game.showScene(Scenes.Scene1)"
			]
		]
		, "exec": {
			"pre": "console.log('Pre-init Exec'); Game.sceneDesc = 'No more heroes!';"
			, "post": "console.log('Post-init Exec')"
		}
	}	
	,"Scene1": {
		"desc": "- Fuck You, leather man!- Fuck You, leather man!- Fuck You, leather man!- Fuck You, leather man!- Fuck You, leather man!"
		,"actions": [
			["- Fight", true, "Game.showScene(Scenes.Scene1)"]
			,["Go away", ""]
			,["Go away", ""]
			,["Go away", ""]
			
		]
		, "exec": {
			"pre": ""
			, "post": ""
		}
	}
	
	
};
