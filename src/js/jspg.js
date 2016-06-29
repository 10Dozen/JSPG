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
		this.sceneDesc = Scene.desc;
		this.sceneActions = Scene.actions;
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
		for (var i=0; i < this.sceneActions.length; i++) {
			var $btn = ".btn-" + (i + 1);
			var shortAnswer, fullAnswer;
			if ( (this.sceneActions[i][0]).constructor === Array ) {
				shortAnswer = this.sceneActions[i][0][0];
				fullAnswer = this.sceneActions[i][0][1];
			} else {
				shortAnswer = this.sceneActions[i][0];
				fullAnswer = this.sceneActions[i][0];
			};
			
			var showAnswer = this.sceneActions[i][1];
			var toExecute = this.sceneActions[i][2];
			
			$(".action-btn-holder").css("display","none");
		
			$( $btn ).html( shortAnswer );	
			$( $btn ).css("display","block");
			
			$( $btn ).attr("toExecute", toExecute);	
			$( $btn ).attr("showDesc", fullAnswer);
			$( $btn ).attr("showAnswer", showAnswer);
			
			$( $btn ).off();
			$( $btn ).on("click", function () {
				Game.hideActions();
				if ( eval( $(this).attr("showAnswer") ) )  {
					Game.showAnswer( $(this).attr("showDesc") );
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
