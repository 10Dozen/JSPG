# JSPG
##### Version: 0.13

### Scene execution order
- Action list cleared
- Scene data copied to separate object
- Scene actions read and conditions tested, available actions are prepared
- `pre_exec` executed, if code returns False - scene execution stops
- Scene description lines compiled - interpolation and filter out empty lines
- Description blobs are rendered
- Scene's actions being set and buttons created
- Action buttons rendered after timeout, inline actions become active
- `post_exec` executed
- Navigation to `goto` scene invoked


### Data structures

`Scenes` object contains keys-value pairs where keys are scenes names, and values - objects of Scene structures. By default game will start from `Scene.Init`, so be sure to define it!

#### Scene
```
SceneName: {
    type: string(type),
    desc: string/array,
    actions: [ <action_object>, ... ],
    portrait: string(URI)
    pre_exec: string(js)/function,
    post_exec: string(js)/function,
    goTo: string  
}
```
`SceneName` is unique name of the scene.

| Key | Type | Description |
| --- | ---- | ------------|
| `type` | string | (optional) Scene's type: scene (default), dialog, title, subtitle |
| `desc` | string or array | (optional) List of strings with scene's description |
| `actions` | array | (optional) List of actions (see below) |
| `portrait` | string | (optional) URI of portrait image. Use only by dialog type |
| `pre_exec` | string/function | (optional) Function or string of JS to be executed before scene rendered. If code returns False - scene rendering will be stopped. |
| `post_exec` | string/function | (optional) Function or string of JS to be executed after scene rendered |
| `goTo` | string | (optional) Name of the scene to switch to after scene is rendered |


#### Action  
```
{
    name: string,
    desc: string,
    tag: string,
    type: string,
    portrait: string(URI),
    condition: string/function,
    exec: string/function,
    goTo: string
}
 ```
 | Key | Type | Description |
 | --- | ---- | ------------|
 | `name` | string | Display name of the action |
 | `desc` | string | (optional) Description line for blob on action selected. If not set - `name` will be used |
 | `tag` | string | (optional) Tag of the action |
 | `type` | string | (optional) Type of the action response blob: scene (default), dialog, hidden |
 | `portrait` | string | (optional) URI for portrait image, for 'dialog' type action |
 | `condition` | string/function | (optional) Condition code, if returns false - action will not be added |
 | `exec` | string/function | (optional) Function or string of JS to be executed on action selection. If code returns False - navigation by `goTo` won't be made |
 | `goTo` | string | (optional) Name of the scene to switch on action selection |




### Notes:

#### Interpolation in description
```js
...
desc: [
    "Normal line",
    "`Line which interpolate ${2+2}`"
]
...
```

#### Code or functions
```js
...
// single line code as string
pre_exec: "console.log('Hello!')"
// or anonymous function
pre_exec: function() { console.log('Hello!') }
// or lambda function
pre_exec: ()=>{ console.log('Hello!')}
// or invoke some declared function
pre_exec: MyFunction
...
```

#### Game object
`Game.goTo('SceneName')` - navigates to scene with given name after a short timeout

`Game.currentScene` - object with current scene's data

#### Helper
Helper object with bunch of useful functions.

Next functions may be used to place HTML elements inside placeholders of the interpolated description blob. E.g.
```js
desc: ["`My line with ${Helper.Img('my_pic.png', tag='MyImg'})``"]
```
###### Helper's Elements related

`Helper.Click(text, callback, tag='', use_limit=1)` -- returns an \<button\> element as clickable 'text' (string) that executed 'callback' (function) on click. 'Tag' (optional string, default '') - some custom tag by which is possible to find this element. Use_limit (optional integer, default 1) - number of clicks before button become disabled; -1 means no limit.

`Helper.Img(uri, tag='', attrs={})` -- return an \<img\> element with given 'uri' (string) as src attribute. 'Tag' (optional string, default '') - some custom tag by which is possible to find this element. 'Attrs' (optional object, default {}) key-value pairs of html attributes and it's value to be applied to element (e.g. {height: '150px', border: '3px solid black'}).

`Helper.Label(text, tag='', attrs={})` -- return an \<label\> element with given 'text' (string). 'Tag' (optional string, default '') - some custom tag by which is possible to find this element. 'Attrs' (optional object, default {}) key-value pairs of html attributes and it's value to be applied to element (e.g. {color: '#ffaadd', class: 'my-label-class''}).

`Helper.Find.ByTag(tag)` -- return html element with given tag. Use JS methods to manipulate with attributes (e.g. `Helper.Find.ByTag('MyImg').src = 'my_second_pic.png'`)


----

Next functions may be used in `pre_exec` code to manipulate scene's data before rendering. Be aware, that functions only change a copy of the current scene, so on return to the same scene a new copy of `Scenes['SceneName']` object will be created.

###### Helper's Scene Description related

`Helper.Desc.Set(lines)` -- replaces scene description lines with given 'lines' (array of strings)

`Helper.Desc.Add(line)` -- adds new 'line' (string) to scene description (in the tail).

`Helper.Desc.AddFirst(line)` -- adds new 'line' (string) in the beginning of the scene description list.

`Helper.Desc.PutAt(line, idx)` -- adds new 'line' (string) in the given position 'idx' (integer) of the scene description list.

`Helper.Desc.Clear()` -- wipes out scene description list.

`Helper.Desc.DeleteAt(idx)` -- removes line at given 'idx' (integer) from scene description list.

###### Helper's Scene Action related

`Helper.Actions.Set(action_list)` -- replaces scene actions with given 'action_list' (array of action config objects)

`Helper.Actions.Add(action_cfg)` -- adds new action (defined by 'action_cfg' (action config object)) to scene action list (in the tail).

`Helper.Actions.AddFirst(action_cfg)` -- adds new action (defined by 'action_cfg' (action config object)) to the beginning of the scene action list.

`Helper.Actions.PutAt(action_cfg, idx)` -- adds new action (defined by 'action_cfg' (action config object)) in the given position 'idx' (integer) of the scene actions list.

`Helper.Actions.GetByTag(tag)` -- return scene's action object with given 'tag' (string) or 'undefined'.

`Helper.Actions.Clear()` -- wipes out scene actions list.

`Helper.Actions.DeleteAt(idx)` -- removes action at given 'idx' (integer) from scene action list.

`Helper.Actions.DeleteByTag(tag)` -- removes action with given 'tag' (string) from scene action list.
