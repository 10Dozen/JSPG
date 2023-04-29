//@wrap:closure:JSPG.Persistence:

this.subscribers = []
this.customSaveObject = null
this.log = new Logger(
    JSPG.Logging.PERSISTENCE.id,
    JSPG.Logging.PERSISTENCE.level
)

this.Entity = {
    Save: function (customDictionary) {
        this.currentSceneName = JSPG.GetCurrentScene().name
        this.custom = customDictionary

        this.subscribers = {}
        JSPG.Persistence.subscribers.forEach(sub => {
            const name = sub[0]
            const obj = sub[1]
            this.subscribers[name] = JSON.stringify(obj)
        })
    },

    Metadata: function () {
        this.date = new Date()
        this.version = JSPG.Meta.version
    }
}

this.getKeyBySlotId = function (slot_id) {
    const guid = JSPG.Meta.guid
    const prefix = `${guid}+${slot_id}`
    return {
        meta: `${prefix}_meta`,
        data: `${prefix}_savegame`
    }
}

this.Save = function (slot_id) {
    const target = this.getKeyBySlotId(slot_id)

    JSPG.Settings.onBeforeGameSaved(this.customSaveObject)

    const meta = new this.Entity.Metadata()
    const data = new this.Entity.Save(this.customSaveObject)
    window.localStorage.setItem(target.meta, JSON.stringify(meta))
    window.localStorage.setItem(target.data, JSON.stringify(data))

    this.log.info('{Save}', `Game was saved to slot ${slot_id} -> [${target.data}]`)
}

this.Load = function (slot_id) {
    const target = this.getKeyBySlotId(slot_id)
    this.log.info('{Load}', `Game was loaded from slot ${slot_id} -> [${target.data}]`)
    const meta = window.localStorage.getItem(target.meta)
    const data = window.localStorage.getItem(target.data)

    if (!meta) return

    const parsedMeta = JSON.parse(meta)
    if (JSPG.Meta.version != parsedMeta.version) {
        console.log(`Saved game version mismatch! Current game version ${JSPG.Meta.version}, but saved game has ${parsedMeta.version}`)
        JSPG.Settings.onVersionMismatch(parsedMeta.version)
    }

    const parsedData = JSON.parse(data)

    this.subscribers.forEach(sub => {
        const name = sub[0]
        const obj = sub[1]
        const rules = sub[2]

        this.loadObject(obj, JSON.parse(parsedData.subscribers[name]), rules)
    })

    this.log.info('{Load}', `Loading scene ${parsedData.currentSceneName}`)
    JSPG.SceneHandler.clearOutput(`Game loaded (slot ${slot_id})`)
    JSPG.GoTo(parsedData.currentSceneName)

    this.log.debug('{Load}', `Executing onAfterGameLoaded`)
    JSPG.Settings.onAfterGameLoaded(parsedData.custom, this.customSaveObject)
    return parsedData.custom
}

this.Delete = function (slot_id) {
    const target = this.getKeyBySlotId(slot_id)
    window.localStorage.removeItem(target.meta)
    window.localStorage.removeItem(target.data)
    this.log.info('{Delete}', `Save file [${target.data}] was deleted!`)
}

this.Subscribe = function(name, obj, rules) {
    this.subscribers.push([name, obj, rules])
}

this.Unsubsribe = function(name) {
    const idx = this.subscribers.findIndex(el => el[0] == name)
    this.subscribers.splice(idx, 1)
}

this.SetSaveObject = function (saveObject) {
    this.customSaveObject = saveObject
}

this.loadObject = function (obj, dataObj, rules={}) {
    for (const k in obj) {
        //log("loadObject", `Checking key [${k}]`)
        // Skip if there is no saved data for this key
        if (!dataObj.hasOwnProperty(k)) {
            log("loadObject", `SKIP. Saved object doesnt contain key [${k}]`)
            continue
        }

        // Skip if data type is different
        if (typeof obj[k] != typeof dataObj[k]) {
            log("loadObject", `SKIP. Target and saved object key [${k}] data type mismatch!`)
            continue
        }

        let rule = true
        let isRuleContainer = false
        const hasRule = rules.hasOwnProperty(k)
        if (hasRule) {
            rule = rules[k]
            isRuleContainer = (typeof rule == typeof Object.prototype) && Array.isArray(rule)
        }

        //log("loadObject", `HasRule: ${hasRule}, isContainer: ${isRuleContainer}, rule: ${rule}`)

        // Skip if rules is bool and mark this field as skippable
        if (hasRule && !isRuleContainer && !rule) {
            log("loadObject", `SKIP. Rule restricts copying of key [${k}]`)
            continue
        }

        if (typeof obj[k] == typeof Object.prototype) {
            // Replace if array
            if (Array.isArray(obj[k])) {
                //log("loadObject", `Copy ARRAY value`)
                obj[k] = dataObj[k]
                continue
            }
            // or invoke function recursevely for deep copy
            //log("loadObject", `Invoking loadObject for nested object!`)
            this.loadObject(obj[k], dataObj[k], rule)
            continue
        } else {
            // Replace if data is not a container
            //log("loadObject", `Copy SIMPLE value!`)
            obj[k] = dataObj[k]
        }

        //log("loadObject", `=== Finished for key [${k}] ===`)
    }
}

this.formatLoadMenuScreen = function (screen) {
    screen.content = []
    for (let i = 0; i < 10; ++i) {
        let title = `Slot ${i + 1} -- Empty slot`
        let onClick = ()=>{}
        const slot = this.getKeyBySlotId(i)
        const metaString = window.localStorage.getItem(slot.meta)

        if (metaString != null) {
            const meta = JSON.parse(metaString)
            const date = new Date(meta.date)
            title = `Slot ${i + 1} -- ${date.toDateString()} ${date.toLocaleTimeString()} -- Game Version: ${meta.version}`
            onClick = () => {
                JSPG.MenuHandler.HideScreen();
                setTimeout(() => { JSPG.Persistence.Load(i); }, 100)
            }
        }
        screen.content.push({title: title, onClick: onClick})
    }
}

this.formatSaveMenuScreen = function (screen) {
    screen.content = []
    const onClick = function (slot_id) {
        JSPG.Persistence.Save(slot_id);
        JSPG.MenuHandler.HideScreen();
    }

    for (let i = 0; i < 10; ++i) {
        let title = `Slot ${i + 1} -- Empty slot`

        const slot = this.getKeyBySlotId(i)
        const metaString = window.localStorage.getItem(slot.meta)
        if (metaString != null) {
            const meta = JSON.parse(metaString)
            const date = new Date(meta.date)
            title = `Slot ${i + 1} -- ${date.toDateString()} ${date.toLocaleTimeString()} -- Game Version: ${meta.version}`
        }

        screen.content.push({title: title, onClick: onClick.bind(null, i)})
    }
}
