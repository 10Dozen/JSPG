

var EditorItem = function () {
	this.SceneViewer = new SceneViewer();
	this.Splash = new Splash();
	this.ExecEdit = new ExecEdit();
	this.ActionEdit = new ActionEdit();

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
        this.scenes.push( new Scene(++this.sceneCounter) );
		this.openScene( this.sceneCounter );
    };

    this.openScene = function (id) {
        this.selectedSceneId = id;

        this.SceneViewer.load( this.getOpenedScene() );

        this.drawScenesList();
    };

    this.saveScene = function () {};

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

    this.drawScenesList = function () {
        var list = "";
        for (var i = 0; i < this.scenes.length; i++) {
            var classname = (this.scenes[i].id == this.selectedSceneId) ? "scene-list-btn-selected" : "scene-list-btn";
            list = list + "<div class='" + classname + "' sceneId='" + this.scenes[i].id + "'>" + this.scenes[i].name + "</div>";
        };
        $(".scene-list-btn-wrapper").html(list);
        this.initEvents();
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
		Editor.Splash.hide();
        Editor.ActionEdit.hide();
	};

    this.initEvents = function () {
        this.removeEvents();

        $('.scene-list-btn').on('click', function () {
			console.log('Scene selected')
			var id = parseInt( $(this).attr('sceneId') );
			console.log(id);
			Editor.openScene(id);
		});
		$('.btn-add-scene').on("click", function () {
			Editor.addScene();
		});
		$('.btn-save-scene').on('click', function () {
            console.log("Scene Saved!");
            Editor.SceneViewer.saveScene();
            Editor.drawScenesList();
		});
		$('.btn-delete-scene').on('click', function () {
            console.log("Scene Deleted!");
            Editor.deleteScene();
            Editor.drawScenesList();
		});
    };

    this.removeEvents = function () {
        $('.scene-list-btn').off();
        $('.btn-add-scene').off();
        $('.btn-delete-scene').off();
        $('.btn-save-scene').off();
    };

    this.init = function () {
    	this.addScene();
        this.initEvents();

        this.Splash.hide();
        this.ActionEdit.hide();
        this.ExecEdit.hide();
    };

    this.init();
};

var SceneViewer = function () {
	this.scene;
	this.temporaryScene;

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
	};

	this.load = function (scene) {
		this.scene = scene;
		this.temporaryScene = new Scene;
		this.temporaryScene.set(scene);

		this.reset();
		$("#scene-name").val(scene.name);
        $("#scene-portrait").val(scene.portraitURL);
        this.setType(scene.type);

		$( $(".desc-wrapper").find("textarea")[0] ).val(scene.blobs[0]);
		for (var i = 1; i < scene.blobs.length; i++) {
			this.addBlob(scene.blobs[i]);
		}
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
    		pre = this.temporaryScene.execPre;
    		post = this.temporaryScene.execPost;
    	} else {
    		this.temporaryScene.execPre = pre;
            this.temporaryScene.execPost = post;
    	}

        if (pre === "") { pre = "n/a"; } else { if (pre.length > 50) { pre = pre.substring(0,47) + "..."; } }
        if (post === "") { post = "n/a"; } else { if (post.length > 50) { post = post.substring(0,47) + "..."; } }

        $(".exec-code-summary").html("<span>Pre</span> " + pre + "  <span>Post</span> " + post);
    };

	this.addAction = function () {
        this.temporaryScene.actions.push(new Action(++Editor.actionCounter));
        $(".action-wrapper").append(
            "<div class='action-item' actionId='" + Editor.actionCounter + "'><div class='btn-short inline btn-edit-action'>✎</div>\r\n<div class='btn-short inline'>✖</div>\r\n<div class='info-text inline'><span>1</span> Do fire <span>Simple</span> GameMain.setState(3); console.log(1); </div></div>"
        );
        this.temporaryScene.resortActions();

        this.initEvents();
    };

	this.resortActionList = function () {
		var actions = this.temporaryScene.actions;
		var displayedList = $(".action-item");

		for (var i = 0; i < displayedList.length; i++) {
			var id = parseInt( $(displayedList[i]).attr("actionId") );
			var action = this.temporaryScene.getActionById(id);
			action.order = (i+1);

			var html = "<span>" + (i+1) + "</span> " + action.name + " <span>" + action.type + "</span> " + action.exec;
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

        $("#scene-type").find("div").on('click', function () {
        	console.log("Scene type changed!");
        	Editor.SceneViewer.setType( $(this).attr("value") );
        });
        $("#btn-add-blob").on("click", function () {
        	Editor.SceneViewer.addBlob("");
        });
        $(".btn-remove-blob").on("click", function () {
        	CX = this;
            $(this).parent().remove();
        });
        $(".btn-edit-exec").on("click", function () {
            Editor.showExecEdit();
        });
        $(".btn-add-action").on("click", function () {
			Editor.SceneViewer.addAction();
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

var Scene = function (id) {
    this.id = id;
    this.name = "UnnamedScene_" + id;
    this.type = "Scene";   // Scene, Dialog, Title, Subtitle
    this.portraitURL = "";
    this.blobs = [""];
    this.execPre = "";
    this.execPost = "";
    this.actions = [];

	this.getActionById = function (id) {
		return (this.actions.filter(function (action) { return action.id == this; }, id).map(function(action) { return action; }))[0];
	}

	this.resortActions = function () {
		this.actions.sort(function (a,b) {return (a.order - b.order)});

		var orderNo = 1;
		for (var i = 0; i < this.actions.length; i++) {
			this.actions[i].order = orderNo++;
		}
	};

	this.set = function (scene) {
    	this.name = scene.name;
    	this.type = scene.type;
    	this.portraitURL = scene.portraitURL;
        this.blobs = [];
        for (var i = 0; i < scene.blobs.length; i++) { this.blobs.push(scene.blobs[i]);  };

        this.execPre = scene.execPre;
        this.execPost = scene.execPost;

        this.actions = scene.actions;
    };
};

var Action = function (id) {
    this.order = -1;
    this.id = id;
    this.name = "ActionName";
    this.type = "Dialog";
    this.portraitURL = "URL";
    this.blobs = ["text","text2"];
    this.exec = "execgo";
    this.goTo = "Scene_1";

    this.save = function() {
        this.order = $("#action-order").val();
        this.name = $("#action-name").val();
        this.exec = $("#action-exec").val();
    };
};

var ExecEdit = function () {
    this.show = function () {
      	$("#textarea-exec-pre-scene").val( Editor.SceneViewer.temporaryScene.execPre );
       	$("#textarea-exec-post-scene").val( Editor.SceneViewer.temporaryScene.execPost );
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
    	this.action.type = type;

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

    this.show = function (id) {
        $('.action-popup').css('display', 'block');

		this.action = Editor.SceneViewer.temporaryScene.actions[id];
		$('.action-order').val(this.action.order);
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

    this.initEvents = function () {
		$('.btn-action-cancel').on("click", function () {
			Editor.hideActionEdit();
		});
		$('.btn-action-save').on("click", function () {
			Editor.hideActionEdit();
		});
    }

    this.initEvents();
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

var Editor;

$(document).ready(function () {
    Editor = new EditorItem();

    $( function() {
    	$( "#sortable" ).sortable();
    	$( "#sortable" ).disableSelection();
    } );
});
