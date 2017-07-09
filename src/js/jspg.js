(function($) {
    $.fn.scrollTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);


var ActionHandler = function () {
	
	this.actions			= [];
	this.actionsId 			= 0;
	this.toExecute			= "";
	
	this.getActionById = function (id) {
		var actionItem = this.actions.find(function (element) {
			var r;
			if (element.id == this) {
				r = element;
			}
			
			return r;		
		}, id);
		
		return actionItem;
	};
	
	this.clearActionList = function () {
		this.actions = [];
		this.actionsId = 0;
	};
	
	this.addAction = function (sceneActionConfig) {
		var name, desc, exec, type, $portrait;		
		
		if ( sceneActionConfig.hasOwnProperty("name") ) {	
			name = sceneActionConfig.name;
		} else {
			throw new Error("|ActionHandler| Action: Name is note defined");
		}
	
		if ( sceneActionConfig.hasOwnProperty("desc") ) {	
			desc = sceneActionConfig.desc;
		} else {
			desc = sceneActionConfig.name;
		}
		
		if ( sceneActionConfig.hasOwnProperty("exec") ) {	
			exec = sceneActionConfig.exec;
		} else {
			exec = "";
		}
		
		if ( sceneActionConfig.hasOwnProperty("type") ) {	
			type = sceneActionConfig.type;
		} else {
			type = "scene";
		}
		
		if ( sceneActionConfig.hasOwnProperty("portrait") ) {	
			$portrait = "<img src='" + sceneActionConfig.portrait + "'/>";
		} else {
			$portrait = "";
		}	
	
		var action = new Action(this.actionsId, name, desc, exec, type, $portrait);
		
		this.actions.push( action );	
		this.actionsId++;
		
		return action;
	};
	
	this.setSceneActions = function () {
		this.clearActionList();
		
		for (var i=0; i < Game.sceneActions.length; i++) {
			var action = this.addAction( Game.sceneActions[i] )
			
			var btn = ".btn-" + i;
			console.log(btn);
			$(".actions").append( "<div class='action-btn btn-" + i + "'></div>" );
			
			$( btn ).html( action.name );
			$( btn ).attr( "actionid", action.id );
			
			$( btn ).css("display","block");			
			$( btn ).css("position","absolute");
			$( btn ).css("left","-200px");
			
			
			
			$( btn ).off();
			$( btn ).on("click", function () {
				Game.AH.hideActionButtons();
				var action = Game.AH.getActionById( $(this).attr("actionid") );
				
				action.showAnswer();
				action.execute();				
			});
		}
		
		$(".actions").css("min-height", $(".actions").height() + "px");	
	};
	
	this.showActionButtons = function () {		
		setTimeout(function () {
			$(".action-btn").css("position","");
			$(".action-btn").css("left","0px");
			
			$(".action-btn").css("opacity", 1);
			Game.execPostScene();
		}, Game.timeouts.showActionButtons);		
	};
	this.hideActionButtons = function () {
		$(".actions").css("min-height", $(".actions").height() + "px");
		
		$(".action-btn").css("display","none");
		$(".action-btn-holder").css("display","block");
		$(".action-btn").css("opacity", 0);
		
		$(".action-btn").off();
		$(".action-btn").remove();
	};
};

var Action = function (id, name, desc, exec, type, portrait) {
	this.id = id;
	this.name = name;
	this.desc = desc;
	this.exec = exec;
	this.type = type;
	this.portrait = portrait;
	
	this.execute = function () {
		Game.AH.toExecute = this.exec;
		setTimeout(function () {
			eval( Game.AH.toExecute );			
		}, Game.timeouts.actionExecute);
		
	};
	
	this.showAnswer = function () {
		if (this.type.toLowerCase() == "hidden") { 
			return;
		}
		
		var answerClass = "scene-odd";
		if (this.type.toLowerCase() == "dialog") {
			answerClass = "scene-odd portrait portrait-right";			
		}
		
		$("#scenes").append( 
			"<div class='scene-description " + answerClass + "'>" 
			+ this.portrait
			+ this.desc
			+ "</div>"
		);
		
		setTimeout(function () {
			$(".scene-odd").css("opacity", 1);
		}, Game.timeouts.showAnswer);
	};
};

var GamePrototype = function () {
	this.scenesCurrentId = 0;
	this.scenesCurrentFrame = 0;
	this.scenesMaxFrame = 0;	
	
	this.currentScene = {};	
	this.sceneType = "";
	this.sceneDesc = "";
	this.sceneActions = [];
	
	this.timeouts = {
		"showActionButtons": 1500
		, "showAnswer": 500
		, "actionExecute": 500
		, "showSceneBase": 500
		, "showSceneStep": 2000
	};
	
	this.goTo = function (SceneName) {
		eval( "Game.showScene(Scenes." + SceneName + ")" )
		
	};
	
	this.showScene = function (Scene) {	
		this.currentScene = Scene;
		this.sceneDesc = Scene.desc;
		
		this.sceneActions = [];
		this.scenesCurrentId++;
		
		this.AH.hideActionButtons();
		this.execPreScene();
		
		if (this.sceneDesc.constructor !== Array) {			
			this.sceneDesc = [this.sceneDesc];
		}
		
		this.sceneType;
		if (this.currentScene.hasOwnProperty("type")) {			
			switch (this.currentScene.type.toLowerCase()) {
				case "title": 
					this.sceneType = "scene-title";
					break;
				case "subtitle": 
					this.sceneType = "scene-subtitle";
					break;
				case "dialog":
					this.sceneType = "scene-even portrait portrait-left";
					break;
				default:
					this.sceneType = "scene-even";			
			}		
		} else {
			this.sceneType = "scene-even";
			this.currentScene.type = "scene-even";
		}
		
		if (this.currentScene.hasOwnProperty("actions")) {
			this.sceneActions = this.currentScene.actions;
		}
		
		// Scene
		this.scenesCurrentFrame = 0;
		this.scenesMaxFrame = this.sceneDesc.length;
		for (var i=0; i < this.sceneDesc.length; i++) {
			var portrait = "";
			if ( 
				(this.currentScene.hasOwnProperty("portrait")) 
				&& (this.currentScene.type).toLowerCase() == "dialog" 
			) {
				portrait = "<img src='" + this.currentScene.portrait + "'/>";				
			}
			
			$block = "<div class='scene-description " + this.sceneType + "'"
			+ " sceneId='" 	+ (this.scenesCurrentId-1) + "'"
			+ " sceneFrame='" + i + "'>" 
			+ portrait
			+ this.sceneDesc[i] + "</div>";
			
			$("#scenes").append( $block	);
			
			// Show Scene
			setTimeout(function () {
				$(".scene-description[sceneId=" + (Game.scenesCurrentId-1) + "][sceneFrame=" + Game.scenesCurrentFrame + "]").css("opacity", 1);
				$(".scene-description[sceneId=" + (Game.scenesCurrentId-1) + "][sceneFrame=" + Game.scenesCurrentFrame + "]").scrollTo();
				
				Game.scenesCurrentFrame++;
				
				// Show Actions
				if (Game.scenesCurrentFrame >= Game.scenesMaxFrame) {
					Game.AH.showActionButtons()					
				}
			}, Game.timeouts.showSceneBase + Game.timeouts.showSceneStep*i);
		}
		
		// Set Actions
		this.AH.setSceneActions();
	};
	
	this.execPreScene = function () {
		if (this.currentScene.hasOwnProperty("exec")){
			if (this.currentScene.exec.hasOwnProperty("pre")){
				eval( this.currentScene.exec.pre );
			}
		}		
	};
	this.execPostScene = function () {
		if (this.currentScene.hasOwnProperty("exec")){
			if (this.currentScene.exec.hasOwnProperty("post")){
				eval( this.currentScene.exec.post );
			}
		}		
	};
	
	this.AH = new ActionHandler();	
	this.AH.hideActionButtons();
	
};

$( document ).ready(function() {
	Game = new GamePrototype();

	Game.goTo( Object.keys(Scenes)[0] );
});
