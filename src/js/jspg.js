var Scenes = {
	"Scene1": {
		"desc": "- You chose a wrong door, leather man. Leather club is two blocks down!"
		,"actions": [
			["- Fuck You!", ""]
			["Go away", ""]
		]	
	}
	, "Scene2": {
	
	}
};


var GamePrototype = function () {
	
	this.showScene = function (Scene) {	
		$("#scenes").append( 
			"<div class='scene-description scene-even'>" 
			+ Scene.desc
			+ "</div>"
		);
		$(".actions").append( Scene.actions );
	};
};

$( document ).ready(function() {
	Game = new GamePrototype();




});
