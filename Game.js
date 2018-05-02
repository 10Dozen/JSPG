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

var Characters = {
	"Main": {
		"pic": "https://a.ppy.sh/7015713?1448466217.png"
	}
	, "NPC1": {
		"pic": "http://65.media.tumblr.com/avatar_6ea49b9b3506_128.png"
	}
};

var Atlas = {

};


var ProjectName = "The Dusin's Game";

var Scenes = {
	"InitScene": {
		"nodes": [
			{ "type": "Title", "text": "The JSPG Title" }
			, { "type": "Subtitle", "text": "The Sub-Title" }
		]
		, "exec": { "post": "Game.goTo('Scene_Dialog')" }
	}
	, "Scene_Dialog": {
		"nodes": [
			{
				"text": "You are enterting the room and look around."
				, "type": "PanelLeft"
			}
			, {
                 "type": "BigImage"
                 , "text": "https://i.redd.it/1p11ihytu3601.jpg"
            }
			, {
				"text": "- Whoa!"
				, "type": "DialogLeft"
				, "portrait": "http://65.media.tumblr.com/avatar_6ea49b9b3506_128.png"
			}
			, {
				"text": "- Whatta yo doing?!"
				, "type": "DialogLeft"
				, "portrait": "http://65.media.tumblr.com/avatar_6ea49b9b3506_128.png"
			}
			, {
				"text": "- Ha-Ha!!"
				, "type": "DialogRight"
				, "portrait": Characters.Main.pic
			}
			, {
				"text": "- AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA!"
				, "type": "DialogLeft"
				, "portrait": "http://65.media.tumblr.com/avatar_6ea49b9b3506_128.png"
			}
		]
		, "exec": { "post": "Game.goTo('Scene1')" }
	}

	, "Scene1": {
		"nodes": [
			{"type": "DialogLeft", "text": "- You chose a wrong door, leather man. Leather club is two blocks down!", "portrait": Characters.NPC1.pic}
		]
		, "actions": [
			{ 
				"name": "- Fuck You!" /* display name, if aDesc not defined -- used as aDesc" */
				, "desc": "- Fuck you!" /* optional */
				, "type": "dialog" /* scene, hidden, dialog */
				, "exec": "Game.goTo('Scene2')" /* code to execute on action clicked */
				,"portrait": Characters.Main.pic
			}
			,{ 
				"name": "- Hello!" /* display name, if aDesc not defined -- used as aDesc" */
				, "desc": "-Hell... FUCK YOU!" /* optional */
				, "type": "dialog" /* scene, hidden, dialog */
				, "exec": "Game.goTo('Scene2')" /* code to execute on action clicked */
				,"portrait": Characters.Main.pic
			}
		]
		, "exec": {
			"pre": "console.log('Pre-init Exec');"
			, "post": "console.log('Post-init Exec')"
		}
	}
	, "Scene2": {
		"nodes": [
        	{"type": "DialogLeft", "text": "- Negative. Fuck. You!", "portrait": Characters.NPC1.pic}
        ]
		, "exec": {"post": "Game.goTo('Scene3')" }
	}	
	, "Scene3": {
		"nodes": [
			{"type": "subtitle", "text": "THE END"}
        ]
	}
};
