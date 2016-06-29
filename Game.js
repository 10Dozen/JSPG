var Scenes = {
	"InitScene": {
		"desc": "<img src='imgs/018.jpg'/>- You chose a wrong door, leather man. Leather club is two blocks down!"
		, "actions": [
			["- Fuck You!", true, "Game.showScene(Scenes.Scene1)"]
		]
		, "exec": {
			"pre": "console.log('Pre-init Exec'); Game.sceneDesc = 'No more heroes!';"
			, "post": "console.log('Post-init Exec')"
		}
	}	
	,"Scene1": {
		"desc": "- Fuck You, leather man!- Fuck You, leather man!- Fuck You, leather man!- Fuck You, leather man!- Fuck You, leather man!"
		,"actions": [
			["- Fight", true, "Game.showScene(Scenes.Scene21)"]
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
