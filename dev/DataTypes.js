//  Title scene

"InitScene": {
	"type":"Title"
	,"desc":"Game Title Name"
	,"exec":{
		"pre":"Game.myVar = 1"
		, "post":"Game.goTo('Intro')"
	}
}

// Simple scene
,"Intro": {
	"type":"Scene"
	,"desc":[
		"Some description text here in first blob"
		,"Another description text here in second blob"
	]
	,"actions":[
		{
			"name":"Displayed Action Name"
			,"exec":"Game.goTo('SceneHub');"
			,"type":"Hidden"
		}
	]
}

