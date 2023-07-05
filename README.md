# JSPG
##### Version: 0.13

### Scene execution order
- Internal action list cleared
- Elements deactivated and element list cleared (in case previous transition wasn't triggered by action selection)
- Scene data copied to separate object, during this process scene actions are read and ction condition is tested. Only available actions will be added.
- `pre_exec` executed, if code returns False - scene execution stops
- Actions options added to HTML, but not visible yet
- Scene description lines compiled - interpolation applied, empty lines filtered out
- Description blobs are rendered
- Scene's actions being set and buttons created
- Action buttons rendered after timeout, inline interactive elements become active
- `post_exec` executed
- Navigation to `goto` scene invoked if set
- On action selection:
    - Action buttons removed and action section become hidden
    - Elements deactivated and element list cleared
    - Action's 'Exec' code is executed. If it returns False - there will be no automatic transition to 'GoTo' scene in the end of the sequence.
    - Action description lines being interpolated and filtered
    - Action description blobs are rendered
    - Checks 'GoTo' scene data:
        a) if 'GoTo' is a string - tranisiton to given scene name will happen;
        b) if 'GoTo' is a function - it will be executed and the scene name is expected to be returned, then 'GoTo' transition will happen.
        c) if 'GoTo' is empty string, or goto-function returns empty string - 'GoTo' transition won't happen.


### Overview



### Data structures

`Scenes` object contains keys-value pairs where keys are scenes names, and values - objects of Scene structures. By default game will start from `Scene.Init`, so be sure to define it!

#### Scene
```
SceneName: {
    type: string(type),
    desc: string or array,
    actions: [ <action_object>, ... ],
    portrait: string(URI)
    pre_exec: string(js)/function,
    post_exec: string(js)/function,
    goto: string  
}
```
`SceneName` is unique name of the scene.

| Key | Type | Description |
| --- | ---- | ------------|
| `type` | string | (optional) Scene's type: scene (default), dialog, title, subtitle |
| `desc` | string or array | (optional) List of strings with scene's description. Strings may containt HTML code and it won't be escaped on rendering (e.g. <img> tag will result in image rendered in the blob). |
| `actions` | array | (optional) List of actions (see below) |
| `portrait` | string | (optional) URI of portrait image. Use only by dialog type |
| `pre_exec` | string/function | (optional) Function or string of JS to be executed before scene rendered. If code returns False - scene rendering will be stopped. |
| `post_exec` | string/function | (optional) Function or string of JS to be executed after scene rendered |
| `goTo` | string | (optional) Name of the scene to switch to after scene is rendered |


#### Action  
```
{
    name: string,
    desc: string or array,
    icon: <Icon_object>
    tag: string,
    type: string,
    portrait: string(URI),
    condition: string/function,
    exec: function,
    goto: string/function
}
 ```
 | Key | Type | Description |
 | --- | ---- | ------------|
 | `name` | string | Display name of the action |
 | `desc` | string | (optional) Description line for blob on action selected. If not set - `name` will be used |
 | `icon` | object | (optional) Icon configuration. See below. |
 | `tag` | string | (optional) Tag of the action |
 | `type` | string | (optional) Type of the action response blob: scene (default), dialog, hidden |
 | `portrait` | string | (optional) URI for portrait image, for 'dialog' type action |
 | `condition` | string/function | (optional) Condition code, if returns false - action will not be added |
 | `exec` | function | (optional) Function to be executed on action selection. Selected action will be passed as argument. If code returns False - navigation/execution of `goTo` won't be made |
 | `goto` | string/function | (optional) Name of the scene to switch on action selection or function that returns name of the scene to switch. Selected action will be passed as argument. |


#### Icon
```
{
    img: string(URI),
    text: string,
    class: string(CSS whitespace separated classes),
    style: string(CSS semi-colon separated style),
    attrs: object (key-value pairs of HTML attributes)
}
```
| Key | Type | Description |
 | --- | ---- | ------------|
 | `img` | string(URI) | (optional) URI for icon image file. |
 | `text` | string | (optional) Character or string to be used as icon |
 | `class` | string | (optional) One or several (separated by whitespace) classnames for <i></i> element. E.g. Font Awesome icon classes. |
 | `style` | string | (optional) Semicolon separated list of CSS styles to apply to icon. |
 | `attrs` | object | (optional) Key-values pair of custom HTML attributes to apply to icon |

Icon will generate `<i>` node with class 'action-btn-icon'. There are few differencies in icon creation depening on way icon was defined:

| Definition | Element | Notes |
| --- | ---- | ------------|
| `{img: 'icon.png'}` | `<i><img/></i>` |  Given `class`, `attrs` and `style` will be aplied to `<img>` element. |
| `{text: '1'}` | `<i>1</i>` | Given `class`, `attrs` and `style` will be aplied to `<i>` element. Text will be nested directly inside `<i>` element. |
| `{class: 'fa fa-icon'}` | `<i></i>` | Given `attrs` and `style` will be aplied to `<i>` element. |

You can define additional classes in both `class` and `attrs` fields, all of them will be applied to element.


### Elements
It is possible to insert raw HTML code inside scene/action description line and it will be injected in page as is. But in case of interactive elements - handling of elements between scenes or on game load is all up to user.

To handle this there is a ElementsHandler component, which allows to create HTML elements, track and handle events, aswell as disabling elements on transition to new scene.

The aproach behind ElementsHandler is that elements created in current scene will be active and interactable (both via UI and script) only during the current scene. Once player selects action or GoTo transition triggered -- elements of current scene is no longer active and accessable (each registered element will be stripped from it's eventHandlers, disabled and removed from search list).

This however still allows you to manually get element via native JS/jQuery functions (e.g. document.getElementsByClass or $(selector)) and read or even change it, but be aware that on game load document will be cleared.

To create an element using ElementsHandler use:
`elementObject = JSPG.ElementsHandler.createElement(type, tag='', content='', style=null, attributes=null, eventsHandlers=[])` - function that creates and register elements in the handler. There are several aliases to this function provided by Helper object: $h.Img, $h.Click, $h.Label, $h.Input.


#### Element object
Object which contains elements data and functions to handle it.

`Element.Get()` - returns HTML code, composed of element's data.

`Element.SetTag(tag)` - adds or overwrites element's tag.

`Element.SetEventHandlers([...<ehData>])` - sets given list of event handlers. TODO

`Element.AddEventHandler(...)` - adds event handler to element.

`Element.RemoveEventHandler(eventName)` - removes event handler for given event.

`Element.Find()` - returns HTML node representing given element.

`Element.Disable()` - disables HTML node and removes all event handlers assosiated with element and HTML node

#### Type parameter
Next HTML elements is available:
| Type | Element type |  Helper function | Description |
| `image` | `<img>` | $h.Img() | Image element |
| `label` | `<label>` | $h.Label() | Plain text |
| `click` | `<button>` | $h.Click() | Clickable text |
| `input` | `<input>` | $h.Input() | One-line input text field |

#### Tag parameter
Human readeable text that will be applied as `tag='...value...'` HTML attribute to created element. Allows to find created element in document and in inner ElementsHandler's track list.

`$h.Find.byTag(tag)` - function returns Element object from ElementsHandler. This is an alias for `JSPG.ElementsHandler.findIndexByTag(tag)` function.

#### Content parameter
Depending on element type this parameter should contain either display text, URI for image or default values for input

| Type | Content meaning |
| `image` | URI to image |
| `label` | Text |
| `click` | Text of clickable |
| `input` | Default value for input |

#### Style parameter
Optional, default `null`. Semicolon separated CSS styles.
HTML `style` attribute to be applied to given element.

#### Attributes parameter
Optional, default `null`. Object of key-value pairs of HTML attributes to be applied to given element (e.g. class, disabled, etc.).

#### EventHandlers parameter
Array that describes event handlers to apply to element.
Should have following structure:
[
    [
        "eventName", // e.g. 'click', 'change'
        callback, // callback function to call on event
        -1, // optional, default -1, limit of callback invokation for this event (e.g. button with limited number of presses)
        false, // optional, default false, disable element once limit reached
    ],
    ["focus", (e)=>{}],
    ["click", (e)=>{}, 2, true] // limited event
]



#### Functions





### Notes:

#### Interpolation in description
Description lines of Scene and Action may include inline code which will be executed during description parsing. If code returns any value - it will be placed instead of code block in resulting line.

To use string interpolation one need to a write normal JS interpolation line and then put it into quotes:

```js
"\` His name was ${ MyHero.name }, and he was a hero! \`"
```
or by adding `>>>` symbols in the beggining of the line:
```js
">>> His name was ${MyHero.name}"
```

or, in case of multiline - add `>>>` but use escape symbols for `${}`:
```
\`\`\`>>> Multiline text
          with name \${MyHero.name}
\`\`\`
```

```js
...
desc: [
    "Normal line",
    "`Line which interpolate ${2+2}`"
]
...
```

#### Code or functions
Executables in Scene or Action configurations may be set by several approaches:
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

This applies to scene.pre_exec, scene.post_exec, action.exec.

### Dynamic scene content

Code from `pre_exec` section of the scene config will be executed right before scene description lines and list of available actions will be generated and rendered. This means that one can modify both during runtime.

To modify scene's description use helper functions of $h.Desc group. Keep in mind, that by adding lines with inline tokens one can easily change whole style of the specific blob. It is also possible to make description lines interpolable by nesting entire line between `/`` chars. To access Scene object use `JSPG.GetCurrentScene()` function - with it it's possible to modify any scene property (e.g. `goto` location).

To modify scene's actions use helper functions of $h.Actions group. To find specific action one can use `$h.Actions.GetByTag(tag)` function that returns action with given tag.



#### Inline blob type definition

It is possible to directly set type of the specific blob in scene (e.g. to represent dialogue). To do so one need to put specific tokens at the beginning of the line:
`{type token}{|}{attributes token}{|} Normal text...` => '>|Blob right

This feature applies for both Scene and Action descriptions. Please note, if action.type is 'hidden' no descriptions will be rendered at all.

##### Type token
| Token | Scene type | Desciption |
| `<` | `scene` | Blob on left side |
| `>` | `scene_right` | Blob on right side |
| `<#` | `dialog` | Blob on left side, with portrait. Attibutes token defines image for portrait, if it's missing - scene.portrait will be used. |
| `#>` | `dialog_right` | Blob on right side, with portrait. Attibutes token defines image for portrait, if it's missing - scene.portrait will be used. |
| `T` | `title` | Title blob |
| `ST` | `subtitle` | Subtitle blob |
| `C` | `container` | Container blob |
| `HID` | `hidden` | Hidden blob, that would not be rendered |

##### Separator |
Tokens should be separated from each other and from blob's text by `|` character.

##### Attributes token
Some tokens may use such token for defining some extra data. For dialog tokens it stores portrait image URI. E.g. `#>|pics/my_character_smile.jpg|- That nice!` will format blob as right-aligned dialog with 'pics/my_character_smile.jpg` image as a portrait.


## Game componets
### Main game object
The main game object is `JSPG` (or `window.JSPG`). There are few public functions that is available:
`JSPG.goTo('SceneName')` - navigates to scene with given name after a short timeout

`JSPG.GetCurrentScene()` - return Scene object with current scene's data

### Components
`JSPG` is also a container for number of objects that handles various components of games:
| Component | Description |
| `JSPG.SceneHandler` | Processing scenes and renders blobs on screen. |
| `JSPG.ActionHandler` | Renders action buttons and handles selection and execution of action code |
| `JSPG.ElementsHandler` | Creates and handles events for custom HTML elements that may be added into blobs. |
| `JSPG.MenuHandler` | Creates and handles menu item buttons, and responsible for creation, renderind and handling menu screens. |
| `JSPG.Persistence` | Provides function to save and restore game data from local storage |
| `JSPG.Helper` | Provides various helper functions to manipulate scene or action content |
| ---- | ---- |
| `JSPG.Entities.Scene` | Scene object represents a scene. Created using user-defined config. After creation it is completely independent from config and may be modified in runtime by provided functions. |
| `JSPG.Entities.Action` | Action object represents an action available for scene. Created using user-defined config. Is separated from config data, so may be modified by provided functions. |
| `JSPG.Entities.Blob` | Blob object represent a single blob of scene/action description. Handles parsing of the description text into HTML code to add on page, including string interpolation and parisong of tokens. |
| `JSPG.Entities.Element` | Element object represents an HTML node that may be injected in scene description. Object contains needed data (like html tag, attributes, etc.) and functions to generate HTML code. |
| `JSPG.Entities.Icon` | Icon object represents an HTML `<i>` node with some sort of icon (e.g. image or text). Contains needed data (html attributes) and function to generate HTML code. |
| `JSPG.Entities.ScreenTemplates.X` | Screen template objects are used for generation menu screen HTML code from user-defined configs. |

### Helper
Helper object with bunch of useful functions. It may be accessed as `JSPG.Helper`, but there is also `$h` alias exists.

Next functions may be used to place HTML elements inside placeholders of the interpolated description blob. E.g.
```js
desc: ["`My line with ${$h.Img('my_pic.png', tag='MyImg'})``"]
```
##### Helper's Elements related

`$h.Click(text, callback, tag='', use_limit=1)` -- returns an \<button\> element as clickable 'text' (string) that executed 'callback' (function) on click. 'Tag' (optional string, default '') - some custom tag by which is possible to find this element. Use_limit (optional integer, default 1) - number of clicks before button become disabled; -1 means no limit.

`$h.Img(uri, tag='', attrs={})` -- return an \<img\> element with given 'uri' (string) as src attribute. 'Tag' (optional string, default '') - some custom tag by which is possible to find this element. 'Attrs' (optional object, default {}) key-value pairs of html attributes and it's value to be applied to element (e.g. {height: '150px', border: '3px solid black'}).

`$h.Label(text, tag='', attrs={})` -- return an \<label\> element with given 'text' (string). 'Tag' (optional string, default '') - some custom tag by which is possible to find this element. 'Attrs' (optional object, default {}) key-value pairs of html attributes and it's value to be applied to element (e.g. {color: '#ffaadd', class: 'my-label-class''}).

`$h.Find.ByTag(tag)` -- return html element with given tag. Use JS methods to manipulate with attributes (e.g. `$h.Find.ByTag('MyImg').src = 'my_second_pic.png'`)


----

Next functions may be used in `pre_exec` code to manipulate scene's data before rendering. Be aware, that functions only change a copy of the current scene, so on return to the same scene a new copy of `Scenes['SceneName']` object will be created.

##### Helper's Scene Description related

`$h.Desc.Set(lines)` -- replaces scene description lines with given 'lines' (array of strings)

`$h.Desc.Add(line)` -- adds new 'line' (string) to scene description (in the tail).

`$h.Desc.AddFirst(line)` -- adds new 'line' (string) in the beginning of the scene description list.

`$h.Desc.PutAt(line, idx)` -- adds new 'line' (string) in the given position 'idx' (integer) of the scene description list.

`$h.Desc.Clear()` -- wipes out scene description list.

`$h.Desc.DeleteAt(idx)` -- removes line at given 'idx' (integer) from scene description list.

##### Helper's Scene Action related

`$h.Actions.Set(action_list)` -- replaces scene actions with given 'action_list' (array of action config objects)

`$h.Actions.Add(action_cfg)` -- adds new action (defined by 'action_cfg' (action config object)) to scene action list (in the tail).

`$h.Actions.AddFirst(action_cfg)` -- adds new action (defined by 'action_cfg' (action config object)) to the beginning of the scene action list.

`$h.Actions.PutAt(action_cfg, idx)` -- adds new action (defined by 'action_cfg' (action config object)) in the given position 'idx' (integer) of the scene actions list.

`$h.Actions.GetByTag(tag)` -- return scene's action object with given 'tag' (string) or 'undefined'.

`$h.Actions.Clear()` -- wipes out scene actions list.

`$h.Actions.DeleteAt(idx)` -- removes action at given 'idx' (integer) from scene action list.

`$h.Actions.DeleteByTag(tag)` -- removes action with given 'tag' (string) from scene action list.
