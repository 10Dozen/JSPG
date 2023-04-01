/*
 * Scenes variable is mandatory and should always contain 'Init' scene (game will start from it).
 *
 *		"SceneName": {
 *			desc: string/array,  // (optional) string or array of strings to render on the screen
 *          type: string(type),  // (optional) type & style of description blobs: scene (default), dialog, title, subtitle
 *			actions: [   
 *              // list of objects of given structure:
 *				{ 
 *                  name: string,  // action display name
 *                  desc: string,  // (optional) description blob text, if not defined - 'name' will be used
 *                  type: string(type),  // (optional) string, one of the following: scene (Default), hidden, dialog
 *                  portrait: string(URI),  // (optional) URI for portrait image, for 'dialog' type action
 *                  condition: string(js)/function,  // (optional) condition code, if returns false - action will not be added
 *                  exec: string(js)/function,  // (optional) js code or function to be executed on action selection
 *					goTo: string  // (optional) scene name to switch on action selection
 *				}
 *			]
 *			, pre_exec: string(js)/function,  // code or function to be executed before scene rendering, allows to modify scene's data before it rendered
 *			, pre_exec: string(js)/function,  // code or function to be executed after scene rendering (including action buttons)
 *          , goTo: string  // scene name to switch once current scene's rendering finished
 *      }
 */


var Scenes = {
	"Init": {
		type: "Title",
		desc: "The JSPG Title",
		goTo: 'Scene_Dialog'
	}	
	, "Scene_Dialog": {
		type: "Dialog",
		desc: [
			"- Whoa!",
			"- Whatta yo doing?"	
		],
		portrait: "http://65.media.tumblr.com/avatar_6ea49b9b3506_128.png",
		post_exec: () => {
			alert("OBJECTION!")
			Game.goTo("Scene1")  /* same as GoTo but invoked manually */
		}
	}
	, "Scene1": {
		desc: "- You chose a wrong door, leather man. Leather club is two blocks down!",
		actions: [
			{ 
				name: "- Fuck You!", /* display name */
				/* desc: "- Fuck you!" // optional - name will be used */
				type: "dialog", /* scene, hidden, dialog */
				exec: "Game.goTo('Scene2')", /* code to execute on action clicked */
				portrait: "https://a.ppy.sh/7015713?1448466217.png"
			},
			{ 
				name: "- Hello!",
				desc: "-Hell... FUCK YOU!",
				type: "dialog" ,
				goTo: "Scene2",
				portrait: "https://a.ppy.sh/7015713?1448466217.png"
			}
		],
		pre_exec: "console.log('Pre-init Exec')",  /* This will be evaluated using eval() before scene redn */
		post_exec: ()=>{ console.log('Post-init Exec') }, /* and this will be invoked as */
	}	
	
	, "Scene2": {
		desc: "This won't be rendered at all",
		pre_exec: () => {
			// Making some changes and force player to navigate to another scene
			window.MyVariable = false
			Game.goTo('Scene3')
			
			// If exec function returns false - current scene rendering will be aborted
			return false
		}
	}	
	
	, "Scene3": {
		desc: "- You want to finish this game?",
		actions: [
			{
				name: "Finish game",
				condition: () => { return window.MyVariable }, /* This action won't be available on first pass */
				goTo: "Scene4"
			},
			{
				name: "Not yet!",
				condition: () => { return !window.MyVariable }, /* This action will be availabe only on first pass*/
				exec: () => { window.MyVariable = true },  /* on selection - makes first action available */
				goTo: "Scene3"  /* and navigate to this scene again */
			}
		]
	}
	
	, "Scene4": {
		desc: "THE END",
		type: "subtitle"
	}	
};
