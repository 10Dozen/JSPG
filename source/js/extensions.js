// === Expansion functions ==
Array.prototype.purge = function (func, thisArg) {
    return this.splice(0, this.length)
}

Array.prototype.selectRandom = function(func, thisArg) {
    return this[Math.floor(Math.random() * this.length)]
}

String.prototype.format = function (...options) {
    /* Returns string formatted by given keys
        'My name is {name}, {age}'.format({age=22, name='John'})  => 'My name is John, 22'
        'My name is {name}'.format('name', 'John') => 'My name is John'
    */
    let resultStr = this.toString()
    if (options.length == 0) return resultStr

    let formatMap = null
    if (typeof options[0] == typeof "") {
        formatMap = {}
        formatMap[options[0]] = options[1]
    } else {
        formatMap = options[0]
    }
    for (const k in formatMap) {
        const keyToReplace= '{' + k + '}'
        while (resultStr.includes(keyToReplace)) {
            resultStr = resultStr.replace('{' + k + '}', formatMap[k])
        }
    }

    return resultStr
};

Element.prototype.attrsModify = function() {
    /*  Use cases:
        .attrsModify('class', 'my-class', false)
        .attrsModify('src', 'myimg.jpg')
        .attrsModify({src: myimg.jpg, class: 'myclass'}, false)
    */
    if (arguments.length == 0) return

    let attrObj = null
    let override = true

    if (typeof arguments[0] == typeof "") {
        attrObj = {}
        attrObj[arguments[0]] = arguments[1]
        override = arguments[2] != undefined
                   ? arguments[2]
                   : override
    } else {
        attrObj = arguments[0]
        override = arguments[1] != undefined
                   ? arguments[1]
                   : override
    }

    for (let key in attrObj) {
        //console.log(`${key} = ${attrObj[key]}`)
        const value = attrObj[key]
        key = key.toLowerCase()
        const isClass = key == 'class'
        const isStyle = key == 'style'

        // Attribures deletion case
        if (value == null || value === '') {
            //console.log('Deletion route')
            if (!override) continue
            if (isClass) {
                this.className = ''
                continue
            }

            this.removeAttribute(key)
            continue
        }

        // Attribute force add case
        if (override) {
            //console.log('Force add/override route')
            if (isClass) {
                this.className = value
                continue
            }

            this.setAttribute(key, value)
            continue
        }

        // Append or create key-value if none
        //console.log('Add/append route')
        if (isClass) {
            this.classList.add(value)
            continue
        }
        if (isStyle) {
            const currentStyle = this.getAttribute('style')
            this.setAttribute(key, `${currentStyle};${value}`)
            continue
        }
        this.setAttribute(key, value)
    }
}
