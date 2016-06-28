var Scenes = {
	"InitScene": {
		"desc": "Init Scene is here"
		, "actions": [
			["Next", "console.log('Text executed')"]
		]
	}
	,"Scene1": {
		"desc": "- You chose a wrong door, leather man. Leather club is two blocks down!"
		,"actions": [
			["- Fuck You!", ""]
			,["Go away", ""]
		]	
	}
};


var GamePrototype = function () {
	
	this.showScene = function (Scene) {	
		$("#scenes").append( 
			"<div class='scene-description scene-even'>" 
			+ Scene.desc
			+ "</div>"
		);		
		
		for (var i=0; i < Scene.actions.length; i++) {
			$(".btn-" + (i + 1)).html( Scene.actions[i][0] );	
			$(".btn-" + (i + 1)).css("display","block");
			
			$(".btn-" + (i + 1)).attr("toExecute", Scene.actions[i][1]);
			
			$(".btn-" + (i + 1)).off();
			$(".btn-" + (i + 1)).on("click", function () {
				eval( $(this).attr("toExecute") );			
			});
			
		};		
	};
	
	
	this.hideActions = function () {
		$(".action-btn").css("display","none");
	};
	
	this.hideActions();
	
};

$( document ).ready(function() {
	Game = new GamePrototype();

	Game.showScene(Scenes.InitScene);


});
