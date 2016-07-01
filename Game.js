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
		"desc": "<img src='imgs/018.jpg'/>- You chose a wrong door, leather man. Leather club is two blocks down!"
		, "actions": [
			{ 
				"name": "- Fuck You!" /* display name, if aDesc not defined -- used as aDesc" */
				, "desc": "You look in the face of the whitsnow and say:<br />- Fuck you!" /* optional */
				, "type": "scene" /* scene, hidden, dialog */
				, "exec": "" /* code to execute on action clicked */
				
			}
		]
		, "exec": {
			"pre": "console.log('Pre-init Exec');';"
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
