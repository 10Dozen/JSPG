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
			$portrait = "<img src='" + sceneActionConfig.portrait + "'>";
		} else {
			$portrait = "";
		}	
	
		this.actions.push( new Action(this.actionsId, name, desc, exec, type, $portrait) );	
		this.actionsId++;
	};
	
	this.showActionButtons = function () {		
		setTimeout(function () {
			$(".action-btn").css("position","");
			$(".action-btn").css("left","0px");
			
			$(".action-btn").css("opacity", 1);
			Game.execPostScene();
		}, 1500);		
	};
	this.hideActionButtons = function () {
		$(".actions").css("min-height", $(".actions").height() + "px");
		
		$(".action-btn").css("display","none");
		$(".action-btn-holder").css("display","block");
		$(".action-btn").css("opacity", 0);
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
		eval( this.exec );
	};
};

var GamePrototype = function () {
	this.scenesCurrentId = 0;
	this.scenesCurrentFrame = 0;
	this.scenesMaxFrame = 0;
	
	this.toExecude = "";
	this.currentScene = {};	
	this.sceneType = "";
	this.sceneDesc = "";
	this.sceneActions = [];
	
	this.goTo = function (SceneName) {
		eval( "Game.showScene(Scenes." + SceneName + ")" )
		
	};
	
	this.showScene = function (Scene) {	
		this.currentScene = Scene;
		this.sceneDesc = Scene.desc;
		
		this.sceneActions = [];		
		this.scenesCurrentId++;	
		
		this.hideActions();
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
					Game.showActions()					
				}
			}, 500 + 2000*i);
		}
		
		// Set Actions
		for (var i=0; i < this.sceneActions.length; i++) {
			var $btn = ".btn-" + (i + 1);			
			var shortAnswer, fullAnswer, type, toExecute;
			var showAnswer;
			
			// this.sceneActions[i].hasOwnProperty("name")
			// this.sceneActions[i].hasOwnProperty("desc")
			// this.sceneActions[i].hasOwnProperty("type")
			// this.sceneActions[i].hasOwnProperty("exec")
			
			nameAnswer =  this.sceneActions[i].name;
			if ( this.sceneActions[i].hasOwnProperty("desc") ) {				
				fullAnswer = this.sceneActions[i].desc;
			} else {
				fullAnswer = this.sceneActions[i].name;
			}
			
			showAnswer = true;
			if ( this.sceneActions[i].hasOwnProperty("type") ) {
				switch ( this.sceneActions[i].type ) {
					case "hidden": 
						type = "hidden";
						showAnswer = false;
						break;
					case "dialog":
						type = "dialog";
						break;					
					default:
						type = "scene";
						this.sceneActions[i].type = "scene";
				}
			} else {
				this.sceneActions[i].type = "scene";			
			}
			
			toExecute = "";
			if ( this.sceneActions[i].hasOwnProperty("exec") ) {
				toExecute = this.sceneActions[i].exec;
			}
			
			portrait = "";
			if ( this.sceneActions[i].hasOwnProperty("portrait") ) {
				toExecute = this.sceneActions[i].portrait;
			}
			
			$(".action-btn-holder").css("display","none");
		
			$( $btn ).html( nameAnswer );	
			$( $btn ).css("display","block");
			
			$( $btn ).css("position","absolute");
			$( $btn ).css("left","-200px");
			
			$( $btn ).attr("toExecute", toExecute);	
			$( $btn ).attr("showDesc", fullAnswer);
			$( $btn ).attr("showAnswer", showAnswer);
			$( $btn ).attr("type", type);
			$( $btn ).attr("portrait", portrait);	
			
			$( $btn ).off();
			$( $btn ).on("click", function () {
				Game.hideActions();
				if ( eval( $(this).attr("showAnswer") ) )  {
					Game.showAnswer( $(this).attr("type"), $(this).attr("showDesc"), $(this).attr("portrait") );
				};
					
				Game.toExecute = $(this).attr("toExecute");
				setTimeout( function () { eval( Game.toExecute ); }, 1000 );	
			});
			
			$(".actions").css("min-height", $(".actions").height() + "px");
		};
		
		
			
		
	};
	
	this.showAnswer = function (Type, Answer, Portrait) {
		var typeClass = "scene-odd";
		if (Type == "dialog") {
			Portrait = "<img src='" + Portrait + "'/>";
			typeClass = "scene-odd portrait portrait-right";
		}
	
	
		$("#scenes").append( 
			"<div class='scene-description" + typeClass + "'>" 
			+ Portrait
			+ Answer
			+ "</div>"
		);
		setTimeout(function () {
			$(".scene-odd").css("opacity", 1);
		}, 500);
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

	Game.showScene(Scenes.InitScene);
});
