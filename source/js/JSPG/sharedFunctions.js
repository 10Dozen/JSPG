// === Shared Functions ===
JSPG['execCode'] = function (code, ...params) {
    if (typeof(code) != typeof("")) return code(...params)
    if (code != "") return eval(code)
    return
}

JSPG['parseParamValue'] = function (paramValue) {
    // Checks param value data type and in case of function
    // executes and return result to context
    if (typeof paramValue === 'function') {
        return paramValue()
    }

    // Otherwise consider as a string
    return paramValue
}

JSPG['uid'] = function () {
    const uid = [
        JSPG.GetCurrentScene().id,
        '-'
    ]
    for (let i = 0; i < 10; ++i) {
        uid.push(this.Constants.UID_SEQ.selectRandom())
    }

    return uid.join('')
}

JSPG['normalizeAndCopyToObject'] = function (objSource, objTarget, propsToNormalize, callbackForProps={}) {
    const selfNormalization = objTarget == null
    if (selfNormalization) objTarget = objSource

    for (const key in objSource) {
        const propCallback = Object.keys(callbackForProps).find(el => el.toLowerCase() == key.toLowerCase())
        let value = objSource[key]
        if (propCallback) {
            const bindedCallback = callbackForProps[propCallback].bind(objTarget)
            value = bindedCallback(value)
        }
        if (value == undefined) continue

        const normalizedPropName = propsToNormalize.find(el => el.toLowerCase() == key.toLowerCase())
        // No normalization needed - copy value as is or skip if self normaliztion routine
        if (!normalizedPropName) {
            if (selfNormalization) continue
            objTarget[key] = value
        }

        objTarget[normalizedPropName] = value
        if (!selfNormalization || key == normalizedPropName) continue

        // Delete non-normalized key if in self normalization routine
        delete objTarget[key]
    }
}

JSPG['getByNormalizedKey'] = function (obj, normalizedKey, orDefault=null) {
    const key = Object.keys(obj).find(key => key.toLowerCase() == normalizedKey)
    if (!key) return orDefault
    return obj[key]
}

JSPG['scrollTo'] = function (uid) {
    const elementsByUID = $(`div[uid="${uid}"]`)
    if (elementsByUID.length == 0) {
        throw new Error(`[JSPG.ScrollTo] Failed to find element with uid=[${uid}].`);
    }
    elementsByUID[0].scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
}
