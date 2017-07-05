

var EditorItem = function () {
    this.scenes = [];
    this.selectedSceneId = 0;
    this.sceneCounter = -1;
    this.actionCounter = -1;

    this.getOpenedScene = function () {
        return this.getSceneById(this.selectedSceneId);
    };

    this.getSceneById = function (id) {
        var scene;
        for (var i = 0; i < this.scenes.length; i++) {
            if (this.scenes[i].id == id) { scene = this.scenes[i]; break; }
        }

        return scene;
    };

    this.addScene = function () {
        this.scenes.push( new Scene(++this.sceneCounter) );
        this.openScene( this.scenes[this.scenes.length - 1].id );
    };

    this.openScene = function (id) {
        this.selectedSceneId = id;
        (this.getSceneById(id)).draw();

        this.drawScenesList();
    };

    this.drawScenesList = function () {
        var list = "";
        for (var i = 0; i < this.scenes.length; i++) {
            var classname = (this.scenes[i].id == this.selectedSceneId) ? "scene-list-btn-selected" : "scene-list-btn";
            list = list + "<div class='" + classname + "' sceneId='" + this.scenes[i].sceneId + "'>" + this.scenes[i].name + "</div>";
        };
        $(".scene-list-btn-wrapper").html(list);
        this.initEvents();
    };

    this.initEvents = function () {
        this.removeEvents();

        $('.scene-list-btn').on('click', function () {
			console.log('Scene selected');
			var id = parseInt( $(this).attr('sceneId') );
			console.log(id);
			Editor.openScene(id);
		});
		$('.btn-save-scene').on('click', function () {
            console.log("Scene Saved!");
            Editor.getOpenedScene().saveScene();
            Editor.drawScenesList();
		});

    };

    this.removeEvents = function () {
        $('.scene-list-btn').off();
        $('.btn-save-scene').off();
    };

    this.init = function () {
        this.addScene();
        this.initEvents();
    };

    this.init();
};

var Scene = function (id) {
    this.id = id;
    this.name = "Unnamed_Scene";
    this.type = "Scene";   // 0 Scene, 1 Dialog, 2 Title, 3 Subtitle
    this.portraitURL = "";
    this.blobs = [""];
    this.execPre = "";
    this.execPost = "";
    this.actions = [];

    this.tempExecPre = this.execPre;
    this.tempExecPost = this.execPost;

    this.draw = function () {
        $("#scene-name").val(this.name);
        $("#scene-portrait").val(this.portraitURL);

        this.setType(this.type);
        this.initEvents();
    };

    this.setType = function (type) {
    		this.type = type;
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
            "<div class='col-full'><textarea class='textarea-max'></textarea><div class='btn-short inline-right btn-remove-blob'>✖</div></div>"
        );

        this.initEvents();
    };

    this.setExecCode = function (pre, post) {
        this.tempExecPre = pre;
        this.tempExecPost = post;

        if (pre === "") { pre = "n/a"; } else { if (pre.length > 50) { pre = pre.substring(0,47) + "..."; } }
        if (post === "") { post = "n/a"; } else { if (post.length > 50) { post = post.substring(0,47) + "..."; } }

        $(".exec-code-summary").html("<span>Pre</span> " + pre + "  <span>Post</span> " + post);
    };

    this.addAction = function () {
        this.actions.push(new ActionItem(++Editor.actionCounter));
        $(".action-wrapper").append(
            "<div class='action-item' actionId='" + Editor.actionCounter + "'><div class='btn-short inline'>✎</div>\r\n<div class='btn-short inline'>✖</div>\r\n<div class='info-text inline'><span>1</span> Do fire <span>Simple</span> GameMain.setState(3); console.log(1); </div></div>"
        )
    };

    this.removeEvents = function () {
        $("#scene-type").find("div").off();
        $("#btn-add-blob").off();
        $(".btn-remove-blob").off();
    };

    this.initEvents = function () {
        this.removeEvents();

        $("#scene-type").find("div").on('click', function () {
            Editor.getOpenedScene().setType( $(this).attr("value") );
        });
        $("#btn-add-blob").on("click", function () {
            Editor.getOpenedScene().addBlob();
        });
        $(".btn-remove-blob").on("click", function () {
            $(this).parent().remove();
        });
        $(".btn-edit-exec").on("click", function () {
            ExecEdit.draw();
        });
        $(".btn-add-action").on("click", function () {
            Editor.getOpenedScene().addAction();
        });
        $(".btn-edit-action").on("click", function () {
            console.log(this);
            A = this;
            // ActionEdit.draw()
        });

    };

    this.saveScene = function () {
        this.name = $("#scene-name").val();
        this.portraitURL = $("#scene-portrait").val();

        this.blobs = [];
        var blobItems = $(".desc-wrapper").find("textarea");
        for (var i = 0; i < blobItems.length; i++) {
            this.blobs.push( $(blobItems[i]).val() );
        }

        this.execPre = this.tempExecPre;
        this.execPost = this.tempExecPost;
    };
}

var ActionItem = function (id) {
    this.order = 0;
    this.id = id;
    this.name = "";
    this.blobs = [];
    this.exec = "";

    this.save = function() {
        this.order = $("#action-order").val();
        this.name = $("#action-name").val();
        this.exec = $("#action-exec").val();
    };
};

var ExecEditItem = function () {
    this.draw = function () {
        $("#textarea-exec-pre-scene").val( Editor.getOpenedScene().tempExecPre );
        $("#textarea-exec-post-scene").val( Editor.getOpenedScene().tempExecPost );

        this.show();
    };

    this.show = function () {
        Splash.show();
        $('.exec-popup').css('display', 'block');
    };
    this.hide = function () {
        Splash.hide();
        $('.exec-popup').css('display', 'none');
    };

    this.save = function () {
        Editor.getOpenedScene().setExecCode(
            $("#textarea-exec-pre-scene").val()
            , $("#textarea-exec-post-scene").val()
        );
        this.hide();
    };

    this.init = function () {
        $('.btn-exec-save').on("click", function () { ExecEdit.save(); });
        $('.btn-exec-cancel').on("click", function () { ExecEdit.hide(); });
    };

    this.init();
};

var ActionEditItem = function () {



    this.show = function () {
        $('.action-popup').css('display', 'block');
        Splash.show();
    };
    this.hide = function () {
        $('.action-popup').css('display', 'none');
    };
}

var SplashItem = function () {
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
var ExecEdit;
var ActionEdit;
var Splash;

$(document).ready(function () {


    Editor = new EditorItem();
    ExecEdit = new ExecEditItem;
    ActionEdit = new ActionEditItem;
    Splash = new SplashItem;

    Splash.hide();
    ExecEdit.hide();
    ActionEdit.hide();
});