var Scene = function (id) {
	this.id = id;
	this.name = "Scene_" + id;
	this.type = "Scene";   // Scene, Dialog, Title, Subtitle
	this.portraitURL = "";
	this.blobs = [""];
	this.exec = { "pre": "", "post": ""};
	this.actions = [];
	this.order = id;

	this.getActionById = function (id) {
		return (this.actions.filter(function (action) { return action.id == this; }, id).map(function(action) { return action; }))[0];
	}

	this.set = function (scene) {
		this.name = scene.name;
		this.type = scene.type;
		this.portraitURL = scene.portraitURL;
		this.blobs = [];
		for (var i = 0; i < scene.blobs.length; i++) {
			this.blobs.push( Editor.PP.preprocess(scene.blobs[i]) );
		};

		this.exec = scene.exec;
		this.actions = [];
		for (var i = 0; i < scene.actions.length; i++) {
			var clonedAction = new Action();
			clonedAction.set( scene.actions[i] );
			this.actions.push(clonedAction);
		}
	};

	this.setProperties = function (name, type, portraitURL, desc, execPre, execPost) {
		this.name = name;
		this.type = type;
		this.portraitURL = portraitURL;
		this.blobs = desc
		this.exec.pre = execPre;
		this.exec.post = execPost;
	}

	this.convert = function () {
		var scene = {
			"type": this.type
			, "desc": this.blobs.length > 1 ? this.blobs : this.blobs[0]
		};

		if (this.portraitURL != "") { scene["portrait"] = this.portraitURL };
		if (this.exec.pre != "" || this.exec.post != "") {
			scene["exec"] = {};
			if (this.exec.pre != "") { scene["exec"]["pre"] = this.exec.pre; };
			if (this.exec.post != "") { scene["exec"]["post"] = this.exec.post; };
		};

		if (this.actions.length > 0) {
			var actions = [];
			for (var i = 0; i < this.actions.length; i++) {
				actions.push( this.actions[i].convert() );
			}
			scene["actions"] = actions;
		}
		return scene;
	}
};

var Action = function (id) {
	this.order = -1;
	this.id = id;
	this.name = "ActionName";
	this.type = "Simple";
	this.portraitURL = "";
	this.blobs = [""];
	this.exec = "";
	this.goTo = -1;

	this.set = function (action) {
		this.order = action.order;
		this.id = action.id;
		this.name = Editor.PP.preprocess(action.name);
		this.type = action.type;
		this.portraitURL = action.portraitURL;
		this.blobs = [];
		for (var i = 0; i < action.blobs.length; i++) { this.blobs.push( Editor.PP.preprocess(action.blobs[i]) ); }
		this.exec = action.exec;
		this.goTo = action.goTo;
	};

	this.convert = function () {
		var action = {
			"name": this.name
			, "exec":  (this.goTo > -1) ? this.exec + "Game.goTo('" + Editor.getSceneById( this.goTo ).name + "');" : this.exec
		};

		if (this.blobs[0] != "") { action["desc"] = this.blobs.length > 1 ? this.blobs : this.blobs[0]; };
		if (this.type != "Simple") { action["type"] = this.type; };
		if (this.portraitURL != "") { action["portrait"] = this.portraitURL; };

		return action;
	}
};

var EditorItem = function () {
	this.SceneViewer = new SceneViewer();
	this.Splash = new Splash();
	this.ExecEdit = new ExecEdit();
	this.ActionEdit = new ActionEdit();
	this.ProjectEdit = new ProjectEdit();
	this.PP = new TextPreprocessor();

	this.ProjectName = "New Project*";
	this.ProjectData = "";

	this.scenes = [];
	this.selectedSceneId = 0;
	this.sceneCounter = -1;
	this.actionCounter = -1;

	this.getOpenedScene = function () {
		return this.getSceneById(this.selectedSceneId);
	};

	this.getSceneById = function (id) {
		return ( this.scenes.filter(function (obj) { return obj.id == this; }, id).map(function(obj) { return obj; }) )[0];

	};

	this.addScene = function () {
		var scene = new Scene(++this.sceneCounter);
		this.scenes.push(scene);
		this.openScene( this.sceneCounter );

		return scene;
	};

	this.openScene = function (id) {
		this.selectedSceneId = id;

		this.SceneViewer.load( this.getOpenedScene() );

		this.drawScenesList(true);
	};

	this.deleteScene = function () {
		var index = (Editor.scenes).indexOf( Editor.getOpenedScene() );
		(Editor.scenes).splice(index,1);

		if (this.scenes.length == 0) {
			this.addScene();
		} else {
			if (index >= this.scenes.length) {
				index = this.scenes.length - 1;
			}
			this.openScene(this.scenes[index].id);
		}
	};

	this.saveScene = function () {
		console.log("Scene Saved!");
		this.SceneViewer.saveScene();
	};
	
	this.drawScenesList = function (isOnOpen) {
		// Resorting
		var ordering = [];
		if (!isOnOpen) {
			// Update scene order according to displayed Scenes list
			var items = $(".scene-list-btn-wrapper div");
			for (var i = 0; i < items.length; i++) {
				var id = parseInt( $(items[i]).attr("sceneId") );
				var scene = this.getSceneById(id);
				scene.order = i;
			}
		};

		// Update according to scene.order value (on file open)
		console.log("Re-sorted scenes")
		this.scenes.sort(function (a,b) { return a.order - b.order });
		ordering = this.scenes;

		// Drawing
		var list = "";
		for (var i = 0; i < ordering.length; i++) {
			var classname = (ordering[i].id == this.selectedSceneId) ? "scene-list-btn-selected" : "scene-list-btn";
			list = list + "<div class='" + classname + "' sceneId='" + ordering[i].id + "'>" + ordering[i].name + "</div>";
		};
		$(".scene-list-btn-wrapper").html(list);
		this.initEvents();
	};

	this.setSceneEditedMark = function () {
		var idRef = "div[sceneId=" + this.selectedSceneId + "]";

		$(".scene-list-btn-wrapper").find(idRef).html(
			($(".scene-list-btn-wrapper").find(idRef).html()).replace("*","") + "*"
		)
	};

	this.showExecEdit = function () {
		Editor.Splash.show();
		Editor.ExecEdit.show();
	};

	this.hideExecEdit = function () {
		Editor.Splash.hide();
		Editor.ExecEdit.hide();
	}

	this.showActionEdit = function (id) {
		Editor.Splash.show();
		Editor.ActionEdit.show(id);
	};

	this.hideActionEdit = function () {
		Editor.SceneViewer.resortActionList();
		Editor.Splash.hide();
		Editor.ActionEdit.hide();

	};

	this.showProjectEdit = function () {
		this.ProjectEdit.show();
		this.Splash.show();
	};

	this.hideProjectEdit = function () {
		this.ProjectEdit.hide();
		this.Splash.hide();
	};

	// Project
	this.reset = function () {
		this.scenes = [];
		this.selectedSceneId = 0;
		this.sceneCounter = -1;
		this.actionCounter = -1;
		this.addScene();
	};

	this.openProjectFile = function (event) {
		var reader = new FileReader();
		reader.onload = function() {
			try {
				Editor.openProject(this.result);
				console.log("Parsed!");
			} catch (e) {
				console.log("Failed to open project file!");
			}
		};

		reader.readAsText(uploader.files[0]);
	};

	this.duplicateScene = function (scene) {
		var newScene = this.addScene();
		
		newScene.name = scene.name + "Copy";
		newScene.portraitURL = scene.portraitURL;
		
		newScene.blobs = [];
		for (var i = 0; i < scene.blobs.length; i++) {
			newScene.blobs.push( scene.blobs[i] );
		};
		
		newScene.actions = [];
		for (var i = 0; i < scene.actions.length; i++) {
			var action = new Action(i);
			action.set(scene.actions[i]);
			
			newScene.actions.push(action);
		};
		
		newScene.exec = {"pre": scene.exec.pre, "post": scene.exec.post };		
		
		this.SceneViewer.load( this.getOpenedScene() );
	};
	
	this.openProject = function (codeString) {
		this.reset();
		var name = ( codeString.match(/var Projectname\s*=\s*"(.*)";/i) )[1];

		this.ProjectName = (typeof name[1] == "undefined") ? "New Project*" : name;
		this.ProjectData = JSON.parse((codeString.match( new RegExp("^var Scenes =((.)+(\n(.)+)+);","im") )[1]).replace(/\/\*(.)+\*\//gi, ""));

		this.showProjectTitle(this.ProjectName);

		var keys = Object.keys(this.ProjectData);
		for (var i = 0; i < keys.length; i++) {
			var sceneData = this.ProjectData[keys[i]];
			var scene = this.addScene();

			var type = (typeof sceneData.type == "undefined") ? "Scene" : sceneData.type;
			var portrait = (typeof sceneData.portrait == "undefined") ? [""] : sceneData.portrait;

			var desc = [];
			if (sceneData.hasOwnProperty("desc")) {
				desc = (typeof sceneData.desc == "string") ? [sceneData.desc] : sceneData.desc;
			} else {
				desc = [""];
			}

			var execPre, execPost = "";
			if (typeof sceneData.exec == "undefined") {
				execPre = "";
				execPost = "";
			} else {
				execPre = (typeof sceneData.exec.pre == "undefined") ? "" : sceneData.exec.pre;
				execPost = (typeof sceneData.exec.post == "undefined") ? "" : sceneData.exec.post;
			}

			scene.setProperties( keys[i], type, portrait, desc, execPre, execPost );

			scene.actions = [];
			if (!sceneData.hasOwnProperty("actions")) { sceneData.actions = []; }
			for (var j = 0; j < sceneData.actions.length; j++) {
				var actionData = sceneData.actions[j];
				var name = actionData.name;
				var type = (actionData.hasOwnProperty("type")) ? actionData.type : "Simple";

				var exec;
				var goTo = -1;
				if (actionData.hasOwnProperty("exec")) {
					var execGoToMatches = (actionData.exec).match(/(\n)*Game.goTo\(((.)*)\)(\n)*/i);
					if (typeof execGoToMatches[2] != "undefined") {
						goTo = 1 + keys.indexOf( execGoToMatches[2].split("'").join("").split('"').join("") );
						exec = (actionData.exec).replace(/(\n)*Game.goTo\(((.)*)\)[;]*(\n)*/i, "");
					}
				} else {
					exec = "";
				}

				var portrait = (actionData.hasOwnProperty("portrait")) ? actionData.portrait : "";
				var desc = [];
				if (actionData.hasOwnProperty("desc")) {
					desc = (typeof actionData.desc != "string") ? actionData.desc : [actionData.desc];
				} else {
					desc = [""];
				}

				var action = new Action( ++this.actionCounter );
				action.name = name;
				action.type = type;
				action.blobs = desc;
				action.portraitURL = portrait;
				action.exec = exec;
				action.goTo = goTo;

				scene.actions.push(action);
			}
		}

		this.openScene(0);
		this.deleteScene();
	};

	this.saveProject = function () {
		var text = "var ProjectName = \"" + this.ProjectName + "\";\n\nvar Scenes = {\n";
		var Project = {};
		for (var i = 0; i < this.scenes.length; i++) {
			var sceneData = '"' + this.scenes[i].name + '": ' + JSON.stringify( this.scenes[i].convert() );
			text = text + sceneData + "\n,";
		}
		text = text.substring(0, text.length - 1) + "};\n\n";

		var a = document.createElement('a');
		a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( text ));
		a.setAttribute('download', "Game.js" );
		a.click();

		return text;
	};

	this.getExportedProject = function () {
		var br = "";//"&lt;br /&gt;";
		var text = "var ProjectName = \"" + this.ProjectName + "\";<br />" + br + "var Scenes = {<br />&nbsp;&nbsp;&nbsp;&nbsp;" + br;
		var Project = {};
		for (var i = 0; i < this.scenes.length; i++) {
			var sceneData = '"' + this.scenes[i].name + '": ' + JSON.stringify( this.scenes[i].convert() );
			text = text + "" + sceneData.replace(/</g, '&lt').replace(/>/g, '&gt') + "<br />&nbsp;&nbsp;&nbsp;&nbsp;," + br;
		}
		text = text.substring(0, text.length - 1) + "<br />};<br /><br />";
		// text = text + "};<br /><br />" + br + br;
		
		return text;
	};
	
	this.showProjectTitle = function (text) {
		$("#project-title").html(text);
	};

	this.initEvents = function () {
		this.removeEvents();

		$('.scene-list-btn').on('click', function () {
			var id = parseInt( $(this).attr('sceneId') );
			Editor.saveScene();
			Editor.openScene(id);
		});
		$('.btn-add-scene').on("click", function () {
			Editor.saveScene();
			Editor.addScene();
		});
		$('.btn-save-scene').on('click', function () {
			Editor.saveScene();
			Editor.drawScenesList(true);
		});
		$('.btn-delete-scene').on('click', function () {
			console.log("Scene Deleted!");
			Editor.deleteScene();
			Editor.drawScenesList(false);
		});
		$('#project-title').on("click", function () {
			Editor.showProjectEdit();
		});
		$('.btn-save-project').on("click", function () {
			Editor.saveProject();
		});
	};

	this.removeEvents = function () {
		$('.scene-list-btn').off();
		$('.btn-add-scene').off();
		$('.btn-delete-scene').off();
		$('.btn-save-scene').off();
		$('#project-title').off();
		$('.btn-save-project').off();
	};

	this.init = function () {

		this.initEvents();

		this.Splash.hide();
		this.ActionEdit.hide();
		this.ExecEdit.hide();
		this.ProjectEdit.hide();

		$( "#sortable" ).sortable({
			stop: function () {
				Editor.SceneViewer.resortActionList();
				Editor.setSceneEditedMark();
			}
		});
		$( "#sortable" ).disableSelection();
		$( ".scene-list-btn-wrapper" ).sortable({
			stop: function () {
			 	Editor.drawScenesList(false);
				Editor.showProjectTitle(Editor.ProjectName + "*");
			}
		});
	};

	this.init();
};

var SceneViewer = function () {
	this.scene;
	this.temporaryScene = new Scene();

	this.reset = function () {
		$("#scene-name").val("");
		$("#scene-portrait").val("");
		this.setType("Scene");
		var blobs = $(".desc-wrapper").find("textarea");
		for (var i = 0; i < blobs.length; i++) {
			if (i > 0) {
				$(blobs[i]).parent().remove();
			} else {
				$(blobs[i]).val("");
			}
		};

		this.setExecCode();

		$(".action-wrapper").find(".action-item").remove();
	};

	this.load = function (scene) {
		this.scene = scene;
		this.temporaryScene.set(scene);

		this.reset();
		$("#scene-name").val(scene.name);
		$("#scene-portrait").val(scene.portraitURL);
		this.setType(scene.type);

		$( $(".desc-wrapper").find("textarea")[0] ).val( this.escapeTags(scene.blobs[0]) );
		for (var i = 1; i < scene.blobs.length; i++) {
			this.addBlob( 
				this.escapeTags(scene.blobs[i])
			);
		}

		this.temporaryScene.actions.sort(function (a,b) { return (a.order - b.order); });
		for (var i = 0; i < this.temporaryScene.actions.length; i++) {
			this.addAction(false, this.temporaryScene.actions[i]);
		}
	};

	this.escapeTags = function (text) {
		return text.replace(/<br \/>/g, "\r\n").replace(/<img src='(.*)' \/>/g, "#img($1)")
	};
	
	
	this.setType = function (type) {
		this.temporaryScene.type = type;
		$("#scene-type").find('.type-switch-on').removeClass('type-switch-on').addClass('type-switch-off');
		$("#scene-type").find('div[value="' + type + '"]').removeClass('type-switch-off').addClass('type-switch-on');

   		if (type == "Dialog") {
			$(".scene-portrait-list-item").css("display", "block");
		} else {
			$(".scene-portrait-list-item").css("display", "none");
		}
	};

	this.addBlob = function (text) {
		$(".desc-wrapper").append(
			"<div class='col-full'><textarea class='textarea-max'>" + text + "</textarea><div class='btn-short inline-right btn-remove-blob'>✖</div></div>"
		);
		this.initEvents();
	};

	this.setExecCode = function (pre, post) {
		if (typeof pre === "undefined" && typeof post === "undefined") {
			pre = this.temporaryScene.exec.pre;
			post = this.temporaryScene.exec.post;
		} else {
			this.temporaryScene.exec.pre = pre;
			this.temporaryScene.exec.post = post;
		}

		if (pre === "") { pre = "n/a"; } else { if (pre.length > 50) { pre = pre.substring(0,47) + "..."; } }
		if (post === "") { post = "n/a"; } else { if (post.length > 50) { post = post.substring(0,47) + "..."; } }

		$(".exec-code-summary").html("<span>Pre</span> " + pre + "  <span>Post</span> " + post);
	};

	this.addAction = function (isNew, action) {
		if (isNew) {
			action = new Action(++Editor.actionCounter);
			this.temporaryScene.actions.push(action);
		};

		$(".action-wrapper").append(
		   	"<div class='action-item' actionId='" + action.id + "'><div class='btn-short inline btn-edit-action'>✎</div>\r\n<div class='btn-short inline'>✖</div>\r\n<div class='info-text inline'></div></div>"
		);

		this.resortActionList();

		this.initEvents();
	};

	this.resortActionList = function () {
		var actions = this.temporaryScene.actions;
		var displayedList = $(".action-item");

		for (var i = 0; i < displayedList.length; i++) {
			var id = parseInt( $(displayedList[i]).attr("actionId") );
			var action = this.temporaryScene.getActionById(id);
			action.order = (i+1);

			var goToSceneName = (typeof Editor.getSceneById(action.goTo) == "undefined") ? "" : Editor.getSceneById(action.goTo).name;

			var html = "<span>" + (i+1) + "</span> " + action.name +
				" <span>" + action.type + "</span> " + action.exec +
				" <span>-> " + goToSceneName + " </span>";
			$( displayedList[i] ).find(".info-text").html(html);
		}
	};

	this.saveScene = function () {
		this.temporaryScene.name = $("#scene-name").val();
		this.temporaryScene.portraitURL = $("#scene-portrait").val();

		this.temporaryScene.blobs = [];
		var blobItems = $(".desc-wrapper").find("textarea");
		for (var i = 0; i < blobItems.length; i++) {
			this.temporaryScene.blobs.push( $(blobItems[i]).val() );
		}

		Editor.getOpenedScene().set(this.temporaryScene);
	};

	this.removeEvents = function () {
		$("#scene-type").find("div").off();
		$("#btn-add-blob").off();
		$(".btn-remove-blob").off();
		$(".btn-edit-exec").off();
		$(".btn-add-action").off();
		$(".btn-edit-action").off();
	};

	this.initEvents = function () {
		this.removeEvents();
		$("input").on("change", function () {
			Editor.setSceneEditedMark();
		});
		$("textarea").on("change", function () {
			Editor.setSceneEditedMark();
		});
		$("#scene-type").find("div").on('click', function () {
			Editor.SceneViewer.setType( $(this).attr("value") );
			Editor.setSceneEditedMark();
		});
		$("#btn-add-blob").on("click", function () {
			Editor.SceneViewer.addBlob("");
			Editor.setSceneEditedMark();
		});
		$(".btn-remove-blob").on("click", function () {
			$(this).parent().remove();
			Editor.setSceneEditedMark();
		});
		$(".btn-edit-exec").on("click", function () {
			Editor.showExecEdit();
		});
		$(".btn-add-action").on("click", function () {
			Editor.SceneViewer.addAction(true);
			Editor.setSceneEditedMark();
		});
		$(".btn-edit-action").on("click", function () {
			Editor.showActionEdit( parseInt($(this).parent().attr("actionId")) );
		});
	};

	this.init = function () {
		this.temporaryScene = new Scene();
		this.initEvents();
	};

	this.init();
};

var ExecEdit = function () {
	this.show = function () {
	  	$("#textarea-exec-pre-scene").val( Editor.SceneViewer.temporaryScene.exec.pre );
	   	$("#textarea-exec-post-scene").val( Editor.SceneViewer.temporaryScene.exec.post );
		$('.exec-popup').css('display', 'block');
	};

	this.hide = function () {
		$('.exec-popup').css('display', 'none');
	}

	this.save = function () {
		Editor.SceneViewer.setExecCode(
			$("#textarea-exec-pre-scene").val()
			, $("#textarea-exec-post-scene").val()
		)

	   	Editor.hideExecEdit();
	};

	this.init = function () {
		$('.btn-exec-save').on("click", function () { Editor.ExecEdit.save(); });
		$('.btn-exec-cancel').on("click", function () { Editor.hideExecEdit(); });
	};

	this.init();
};

var ActionEdit = function () {
	this.action;

	this.setType = function (type) {
		$("#action-type").find('.type-switch-on').removeClass('type-switch-on').addClass('type-switch-off');
		$("#action-type").find('div[value="' + type + '"]').removeClass('type-switch-off').addClass('type-switch-on');

   		if (type == "Dialog") {
			$(".action-portrait-line-item").css("display", "block");
		} else {
			$(".action-portrait-line-item").css("display", "none");
		}
	};

	this.addBlob = function (text) {;
		$(".action-desc-wrapper").append(
			"<div class='col-full'><textarea class='textarea-max'>" +
				text + "</textarea><div class='btn-short inline-right btn-action-remove-blob'>✖</div></div>"
		);
		this.initEvents();
	};

	this.save = function () {
		this.action.name = $('.action-name').val();
		this.action.type = $("#action-type").find(".type-switch-on").attr("value");
		this.action.portraitURL = $('.action-portrait').val();

		this.action.blobs = [];
		var blobItems = $(".action-desc-wrapper").find("textarea");
		for (var i = 0; i < blobItems.length; i++) {
			this.action.blobs.push( $(blobItems[i]).val() );
		}

		this.action.exec = $(".action-exec").val();
		this.action.goTo = $("#action-goto").val();
	};

	this.composeGoTo = function () {
		var html = "";
		for (var i = 0; i < Editor.scenes.length; i++) {
			html = html + "<option value=" + Editor.scenes[i].id + ">" + Editor.scenes[i].name + "</option>";
		}

		$("#action-goto").html(html);
	};

	this.reset = function () {
		$('.action-name').val("");
		this.setType("Simple");
		$('.action-portrait').val("");
		$( $(".action-desc-wrapper").find("textarea")[0] ).val("");
		var blobs = $(".action-desc-wrapper").find(".col-full");
		for (var i = 1; i <blobs.length; i++) {
			$(blobs[i]).remove();
		}
		$(".action-exec").val("");
		$("#action-goto").val("");
	};

	this.show = function (id) {
		$('.action-popup').css('display', 'block');
		this.reset();
		this.composeGoTo();

		this.action = Editor.SceneViewer.temporaryScene.getActionById(id);
		$('.action-order').html(this.action.order);
		$('.action-name').val(this.action.name);
		this.setType(this.action.type);
		$('.action-portrait').val(this.action.portraitURL);

		$( $(".action-desc-wrapper").find("textarea")[0] ).val(this.action.blobs[0]);
		for (var i = 1; i < this.action.blobs.length; i++) {
			this.addBlob(this.action.blobs[i]);
		}
		$(".action-exec").val(this.action.exec);

		$("#action-goto").val(this.action.goTo);
	};

	this.hide = function () {
		$('.action-popup').css('display', 'none');
	};

	this.removeEvents = function () {
		$('.btn-action-cancel').off();
		$('.btn-action-save').off();
		$('#action-type').find("div").off();
		$('.btn-action-add-blob').off();
		$('.btn-action-remove-blob').off();
	};

	this.initEvents = function () {
		this.removeEvents();

		$('.btn-action-cancel').on("click", function () {
			Editor.hideActionEdit();
		});
		$('.btn-action-save').on("click", function () {
			Editor.ActionEdit.save();
			Editor.hideActionEdit();
		});
		$('#action-type').find("div").on("click", function () {
			Editor.ActionEdit.setType($(this).attr("value"));
		});
		$('.btn-action-add-blob').on("click", function () {
			Editor.ActionEdit.addBlob("");
		});
		$('.btn-action-remove-blob').on("click", function () {
			$(this).parent().remove();
		});
	}

	this.initEvents();
}

var ProjectEdit = function () {
	this.show = function () {
		$('.project-name').val( Editor.ProjectName );
		$('.project-popup').css({ "display":"block", "max-width": "900px" });
		
		var exportedData = Editor.getExportedProject();
		if ($("#export-field").length == 0) {
			$('.project-popup-wrapper').append("<hr /><br /><div id='export-field'>" + exportedData + "</div>");
			$("#export-field").css({ "font-size": "5px" });
		} else {
			$("#export-field").html( exportedData );
		};		
	};

	this.hide = function () {
		$('.project-popup').css("display","none");
	};

	this.save = function () {
		Editor.ProjectName = $('.project-name').val();
		Editor.showProjectTitle( Editor.ProjectName );
		Editor.hideProjectEdit();
	};

	this.init = function () {
		$('.btn-project-properties-save').on("click", function () { Editor.ProjectEdit.save(); });
		$('.btn-project-properties-cancel').on("click", function () { Editor.hideProjectEdit(); });
	};

	this.init();
}

var Splash = function () {
	this.showed = false;
	this.show = function () {
		this.showed = true;
		$('.splash').css('display', 'block');
	};
	this.hide = function () {
		this.showed = false;
		$('.splash').css('display', 'none');
	};
};

var Validator = function () {};

var TextPreprocessor = function () {
	this.ppTemplates = [
		[ /#img\((.+)\)/i, "<img src='{0}' />"]
		, [ /#b\((.+)\)/i, "<b>{0}</b>"]
		, [ /#i\((.+)\)/i, "<i>{0}</i>"]
	];

	this.preprocess = function (text) {
		while (this.checkForPPMatches(text)) {
			for (var i = 0; i < this.ppTemplates.length; i++) {
				var match = text.match(this.ppTemplates[i][0]);
				if (match != null) {
					text = text.replace(this.ppTemplates[i][0], this.replace(this.ppTemplates[i][1], match[1]));
				}
			}
		}

		text = this.escapeLinebreaks(text);
		return text;
	};

	this.checkForPPMatches = function (text) {
		for (var i = 0; i < this.ppTemplates.length; i++) {
			if (text.match(this.ppTemplates[i][0]) != null) { return true; }
		}
		return false;
	};

	this.replace = function (text, replacement) {
		while ( text.indexOf("{0}") > -1 ) { text = text.replace("{0}", replacement); };
		return text;
	};
	
	this.escapeLinebreaks = function (text) {
		while (text.indexOf("\n") > -1) { text = text.replace("\n","<br />"); };
		return text;
	}
};

var Editor;

$(document).ready(function () {
	Editor = new EditorItem();
	Editor.addScene();

});
