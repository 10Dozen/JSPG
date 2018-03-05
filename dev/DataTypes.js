//
// Title scene
//
"InitScene": {
	"type":"Title"
	,"desc":"Game Title Name"
	,"exec":{
		"pre":"Game.myVar = 1"
		, "post":"Game.goTo('Intro')"
	}
}

"InitScene": {
	"type":"Title"
	,"desc": [
		"Game Title Name"
		, "Another title line for any reason"
	]
	,"exec":{
		"pre":"Game.myVar = 1"
		, "post":"Game.goTo('Intro')"
	}
}

//
//  Subtitle scene
//
"InitScene": {
	"type":"Subitle"
	,"desc":"Game Title Name"
	,"exec":{
		"pre":"Game.myVar = 2"
		, "post":"Game.goTo('Intro')"
	}
}

//
// Simple scene
//
,"Intro": {
	"type":"Scene"
	,"desc":[
		"Some description text here in first blob"
		,"Another description text here in second blob"
	]
	,"actions":[ ... ]
}

//
// Dialog scene
//
,"Dialog1": {
	"type":"Dialog"
	,"desc":[
		"Some description text here in first blob"
		,"Another description text here in second blob"
	]
	,"portrait":"img/character1.jpg"
	,"actions":[ ... ]
}
		    
	
//
// Actions
//    
		    
		    
{
	"name":"Displayed Action Name"
	,"exec":"Game.goTo('SceneHub');"
	,"type":"Hidden"
}
