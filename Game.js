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
 *			, (Optional) "exec": {
 *				(Optional)  "pre": 		@CodeToExecuteBeforeTheScene(string/jscode)
 *				, (Optional)  "post":		@CodeToExecuteAFterTheScene(string/jscode)
 *			}
 *		}
 *
 *
 */


var Scenes = {
	"InitScene": {
		"type": "Title"
		, "desc": "The JSPG Title"
		, "exec": { "post": "Game.goTo('Scene_Dialog')" }
	}	
	, "Scene_Dialog": {
		"type": "Dialog"
		, "desc": [
			"- Whoa!"
			, "- Whatta yo doing?"	
		]
		, "portrait": "http://65.media.tumblr.com/avatar_6ea49b9b3506_128.png"
		, "exec": { "post": "Game.goTo('Scene1')" }
	
	}
	, "Scene1": {
		"desc": "- You chose a wrong door, leather man. Leather club is two blocks down!"
		, "actions": [
			{ 
				"name": "- Fuck You!" /* display name, if aDesc not defined -- used as aDesc" */
				, "desc": "- Fuck you!" /* optional */
				, "type": "dialog" /* scene, hidden, dialog */
				, "exec": "Game.goTo('Scene2')" /* code to execute on action clicked */
				,"portrait": "https://a.ppy.sh/7015713?1448466217.png"
			}
			,{ 
				"name": "- Hello!" /* display name, if aDesc not defined -- used as aDesc" */
				, "desc": "-Hell... FUCK YOU!" /* optional */
				, "type": "dialog" /* scene, hidden, dialog */
				, "exec": "Game.goTo('Scene2')" /* code to execute on action clicked */
				,"portrait": "https://a.ppy.sh/7015713?1448466217.png"
			}
		]
		, "exec": {
			"pre": "console.log('Pre-init Exec');"
			, "post": "console.log('Post-init Exec')"
		}
	}	
	
	, "Scene2": {
		"desc": "- You chose a wrong door, leather man. Leather club is two blocks down!"
		, "exec": {"post": "Game.goTo('Scene3')" }
	}	
	, "Scene3": {
		"desc": "THE END"
		, "actions": []
		, "type": "subtitle"
	}	
};
