//@wrap:function:JSPG.ScreenTemplates.simpleText:

this.type = JSPG.Constants.SCREENS.TYPES.SIMPLE_TEXT
this.title = ''
this.content = []
this.HEADER_CLASS = 'simple-menu-header'
this.CONTENT_CLASS = 'simple-menu-content'
this.FIELDS = {
    TITLE: 'title',
    CONTENT: 'content',
    PRE_EXEC: 'pre_exec'
}
this.log = new Logger(
    JSPG.Logging.ENTITIES.SCREEN.id.replace('$id', this.type),
    JSPG.Logging.ENTITIES.SCREEN.level
)

this.fromConfig = function (config) {
    JSPG.normalizeAndCopyToObject(config, this, Object.values(this.FIELDS))
    if (!this.hasOwnProperty(this.FIELDS.PRE_EXEC)) return this

    this.pre_exec(this)
    JSPG.normalizeAndCopyToObject(this, null, Object.values(this.FIELDS))
}

this.Get = function () {
    const html = []
    if (this.title != '') {
        html.push(`<div class='${this.HEADER_CLASS}'>${this.title}</div>`)
    }

    html.push(`<div class='${this.CONTENT_CLASS}'>`)
    for (let idx = 0; idx < this.content.length; ++idx) {
        html.push(`<p>${this.content[idx]}</p>`)
    }
    html.push(`</div>`)
    html.push(`<a href="javascript:void(0)" class="closebtn" onclick="JSPG.MenuHandler.HideScreen()">&times;</a>`)

    return html.join('')
}
