//@wrap:function:JSPG.Entities.Attributes:...params
this.classlist = []
this.stylelist = []
this.attrs = {}

this.modify = function () {
    /*  Use cases:
        attrs.modify('class', 'my-class', false)
        attrs.modify('src', 'myimg.jpg')
        attrs.modify({src: myimg.jpg, class: 'myclass'}, false)
    */
    if (arguments.length == 0) return

    let attrObj = null
    let override = true

    if (typeof arguments[0] == typeof "") {
        attrObj = {}
        attrObj[arguments[0]] = arguments[1]
        override = arguments[2] != undefined
                   ? arguments[2] == JSPG.Constants.OPERATIONS.OVERRIDE
                   : override
    } else {
        attrObj = arguments[0]
        override = arguments[1] != undefined
                   ? arguments[1] ==JSPG.Constants.OPERATIONS.OVERRIDE
                   : override
    }

    for (let key in attrObj) {
        //console.log(`${key} = ${attrObj[key]}`)
        const value = attrObj[key]
        key = key.toLowerCase()
        const listname = key == 'class'
                         ? 'classlist'
                         : (key == 'style' ? 'stylelist' : null)

        // Attribures deletion case
        if (value == null || value === '') {
            //console.log('Deletion route')
            if (!override) continue
            if (listname != null) {
                this[listname].purge()
                continue
            }

            delete this.attrs[key]
            continue
        }

        // Attribute force add case
        if (override) {
            //console.log('Force add/override route')
            if (listname != null) {
                this[listname].purge()
                this._composeList(listname, value)
                continue
            }

            this.attrs[key] = value
            continue
        }

        // Append or create key-value if none
        //console.log('Add/append route')
        if (listname != null) {
            this._composeList(listname, value)
            continue
        }
        this.attrs[key] = this.attrs.hasOwnProperty(key)
                          ? `${this.attrs[key]} ${value}`
                          : value
    }
}

this.get = function(key) {
    key = key.toLowerCase()
    return (key == 'class') ? this.classlist.join(' ') : this.attrs[key]
}

this._composeList = function (listname, lineValue) {
    const delimeter = listname == 'classlist' ? ' ' : ';'
    const values = lineValue.split(delimeter)
    for (let i = 0; i < values.length; ++i) {
        this[listname].push(values[i])
    }
}

this.compose = function () {
    const attrList = []
    for (const k in this.attrs) {
        attrList.push(`${k}="${this.attrs[k]}"`)
    }
    return `class="${this.classlist.join(" ")}" ${attrList.join(" ")} style="${this.stylelist.join(";")}"`
}

{
    this.modify(params[0])
}
