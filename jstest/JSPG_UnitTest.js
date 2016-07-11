var ActionsProperties = {
	"SceneActions": {
		"AllParameters": {
			"name": "ActionName1"
			, "desc": "You look in the face of the whitsnow and say:<br />- Fuck you!"
			, "type": "scene" 
			, "exec": "ActionExecuted = false; ActionExecuted = true;"			
		}
		, "OnlyMandatoryParameters": {
			"name": "ActionName1-Mandotary"	
		}
	
	}
	, "HiddenAction": {
		"AllParameters": {
			"name": "HiddenActionName1"
			, "desc": "You look in the face of the whitsnow and say:<br />- Fuck you!"
			, "type": "hidden" 
			, "exec": "ActionExecuted = false; ActionExecuted = true;"	
		}
	}
	, "DialogAction": {
		"AllParameters": {
			"name": "HiddenActionName1"
			, "desc": "You look in the face of the whitsnow and say:<br />- Fuck you!"
			, "type": "hidden" 
			, "exec": "ActionExecuted = false; ActionExecuted = true;"	
			, "portrait": "https://a.ppy.sh/7015713?1448466217.png"
		}
	}
};


describe("Action Handler", function() {

	describe("Add new Scene action - All Parameters", function () {
		it ("Create simple scene action (Game.AH.addAction)", function () {
			var initActionId = Game.AH.actionsId;
			var initActionCount = Game.AH.actions.length;
		
			Game.AH.addAction( ActionsProperties.SceneActions.AllParameters );
			
			var afterActionId = Game.AH.actionsId;
			var afterActionCount = Game.AH.actions.length;
			
			assert(
				( afterActionId > initActionId )
				, "Action creation failed: ActionId not updated"
			);		
			assert( 
				afterActionCount > initActionCount
				, "Action creation failed: Action Object not created"
			);	
		});
		
		
		it ("Find action by id (Game.AH.getActionById)", function () {			
			assert(
				Game.AH.getActionById( Game.AH.actionsId - 1) != null
				, "Failed to find Action"			
			);
		});
		
		it ("Check simple action parameters mapped", function () {
			var id = Game.AH.actionsId - 1;
			var initActionData = ActionsProperties.SceneActions.AllParameters;
			
			assert(
				Game.AH.getActionById(id).name == initActionData.name
				, "Name is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).desc == initActionData.desc
				, "Desc is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).exec == initActionData.exec
				, "Exec is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).type == initActionData.type
				, "Type is not mapped correctly"
			);
			
		});		
		
		it ("Check Scene action Execute" , function () {
			ActionExecuted = false;
			( Game.AH.getActionById( Game.AH.actionsId - 1) ).execute()
			assert( ActionExecuted, "Action Exec failed");			
		});
		
		it ("Check clear action (Game.AH.clearActionList)", function () {
			var initActionId = Game.AH.actionsId;
			var initActionCount = Game.AH.actions.length;
		
			Game.AH.clearActionList();
			
			var afterActionId = Game.AH.actionsId;
			var afterActionCount = Game.AH.actions.length;
			
			assert(
				afterActionId < initActionId 
				, "Action clear failed: ActionId not restored"
			);		
			assert( 
				afterActionCount < initActionCount
				, "Action clear failed: Action Object not cleatred"
			);	
		});
		
	});
	
	describe("Add new Scene action - Mandotary Parameters", function () {
		it ("Create scene action (optional parametes miss)", function () {
			var initActionId = Game.AH.actionsId;
			var initActionCount = Game.AH.actions.length;
		
			Game.AH.addAction( ActionsProperties.SceneActions.OnlyMandatoryParameters );
			
			var afterActionId = Game.AH.actionsId;
			var afterActionCount = Game.AH.actions.length;
		
		
			assert(
				( afterActionId > initActionId )
				, "Action creation failed: ActionId not updated"
			);		
			assert( 
				afterActionCount > initActionCount
				, "Action creation failed: Action Object not created"
			);	
		
		});
		
		it ("Check simple action parameters mapped", function () {
			var id = Game.AH.actionsId - 1;
			var initActionData = ActionsProperties.SceneActions.OnlyMandatoryParameters ;
			
			assert(
				Game.AH.getActionById(id).name == initActionData.name
				, "Name is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).desc == initActionData.name
				, "Desc is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).exec == ""
				, "Exec is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).type == "scene"
				, "Type is not mapped correctly"
			);
			
			assert(
				Game.AH.getActionById(id).portrait == ""
				, "Portrait is not mapped correctly"
			);
		});		
	});

	
	describe("Add new Hidden action", function () {
		it ("Create Hidden action", function () {
			var initActionId = Game.AH.actionsId;
			var initActionCount = Game.AH.actions.length;
		
			Game.AH.addAction( ActionsProperties.HiddenAction.AllParameters );
			
			var afterActionId = Game.AH.actionsId;
			var afterActionCount = Game.AH.actions.length;
		
		
			assert(
				( afterActionId > initActionId )
				, "Action creation failed: ActionId not updated"
			);		
			assert( 
				afterActionCount > initActionCount
				, "Action creation failed: Action Object not created"
			);				
		});
		it ("Check Hidden action parameters mapped", function () {
			var id = Game.AH.actionsId - 1;
			var initActionData = ActionsProperties.HiddenAction.AllParameters;
			
			assert(
				Game.AH.getActionById(id).name == initActionData.name
				, "Name is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).desc == initActionData.desc
				, "Desc is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).exec == initActionData.exec
				, "Exec is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).type == initActionData.type
				, "Type is not mapped correctly"
			);
			
			assert(
				Game.AH.getActionById(id).portrait == ""
				, "Portrait is not mapped correctly"
			);
		});
	});
	
	describe("Add new Dialog action", function () {
		it ("Create Dialog action", function () {
			var initActionId = Game.AH.actionsId;
			var initActionCount = Game.AH.actions.length;
		
			Game.AH.addAction( ActionsProperties.DialogAction.AllParameters );
			
			var afterActionId = Game.AH.actionsId;
			var afterActionCount = Game.AH.actions.length;
		
		
			assert(
				( afterActionId > initActionId )
				, "Action creation failed: ActionId not updated"
			);		
			assert( 
				afterActionCount > initActionCount
				, "Action creation failed: Action Object not created"
			);				
		});
		it ("Check Dialog action parameters mapped", function () {
			var id = Game.AH.actionsId - 1;
			var initActionData = ActionsProperties.DialogAction.AllParameters;
			
			assert(
				Game.AH.getActionById(id).name == initActionData.name
				, "Name is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).desc == initActionData.desc
				, "Desc is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).exec == initActionData.exec
				, "Exec is not mapped correctly"
			);
			assert(
				Game.AH.getActionById(id).type == initActionData.type
				, "Type is not mapped correctly"
			);
			
			assert(
				Game.AH.getActionById(id).portrait == "<img src='" + initActionData.portrait + "'/>"
				, "Portrait is not mapped correctly"
			);
		});
	})
	
	
});
