var Scenes = {
	"InitScene": {
		"desc": "<img src='imgs/018.jpg'/>- You chose a wrong door, leather man. Leather club is two blocks down!"
		, "actions": [
			["- Fuck You!", true, "Game.showScene(Scenes.Scene1)"]
		]
	}
	,"Scene1": {
		"desc": "- Fuck You, leather man!"
		,"actions": [
			["- Fight", true, ""]
			,["Go away", ""]
		]	
	}
};