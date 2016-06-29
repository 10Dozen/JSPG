(function($) {
    $.fn.scrollTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);


var GamePrototype = function () {
	this.scenesCurrentId = 0;
	this.toExecude = "";
	this.currentScene = {};
	
	this.sceneDesc = "";
	
	this.goTo = function (SceneName) {
		eval( "Game.showScene(Scenes." + SceneName + ")" )
		
	};
	
	this.showScene = function (Scene) {	
		this.currentScene = Scene;
		this.sceneDesc = this.currentScene.desc;	
		this.scenesCurrentId++;	
		
		this.hideActions();		
		this.execPreScene();
		
		// Scene
		$block = "<div class='scene-description scene-even' sceneId='" 
			+ (this.scenesCurrentId-1) + "'>" 
			+ this.sceneDesc
			+ "</div>";
		$("#scenes").append( $block	);
		
		// Show Scene
		setTimeout(function () {
			$(".scene-description[sceneId=" + (Game.scenesCurrentId-1) + "]").css("opacity", 1);
			$(".scene-description[sceneId=" + (Game.scenesCurrentId-1) + "]").scrollTo();
		}, 1000);		
		
		// Set Actions
		for (var i=0; i < Scene.actions.length; i++) {
			var answer = Scene.actions[i][0];
			var showAnswer = Scene.actions[i][1];
			var toExecute = Scene.actions[i][2];
			
			$(".action-btn-holder").css("display","none");
		
			$(".btn-" + (i + 1)).html( answer );	
			$(".btn-" + (i + 1)).css("display","block");
			
			$(".btn-" + (i + 1)).attr("toExecute", toExecute);			
			$(".btn-" + (i + 1)).attr("showAnswer", showAnswer);
			
			$(".btn-" + (i + 1)).off();
			$(".btn-" + (i + 1)).on("click", function () {
				Game.hideActions();
				if ( eval( $(this).attr("showAnswer") ) )  {
					Game.showAnswer( $(this).html() );
				};
				
				Game.toExecute = $(this).attr("toExecute");
				setTimeout( function () { eval( Game.toExecute ); }, 1000 );	
			});
			
			$(".actions").css("min-height", $(".actions").height() + "px");
		};
		
		// Show Actions
		setTimeout(function () {
			$(".action-btn").css("opacity", 1);
			Game.execPostScene();
		}, 1500);	
		
	};
	
	this.showAnswer = function (Answer) {
		$("#scenes").append( 
			"<div class='scene-description scene-odd'>" 
			+ Answer
			+ "</div>"
		);
		setTimeout(function () {
			$(".scene-odd").css("opacity", 1);
		}, 500);
	};
	
	this.execPreScene = function () {
		eval( this.currentScene.exec.pre );
	};
	this.execPostScene = function () {
		eval( this.currentScene.exec.post );
	};
	
	this.hideActions = function () {
		$(".actions").css("min-height", $(".actions").height() + "px");
		
		$(".action-btn").css("display","none");
		$(".action-btn-holder").css("display","block");
		$(".action-btn").css("opacity", 0);
	};
	
	this.hideActions();
	
};

$( document ).ready(function() {
	Game = new GamePrototype();

	Game.showScene(Scenes.InitScene);


});
