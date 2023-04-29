//@wrap:function:JSPG.Entities.Blob:typeDefault, portraitDefault, content

this.id = JSPG.uid()
this.type = typeDefault
this.portrait = portraitDefault
this.rawContent = content
this.style = typeDefault == undefined ? JSPG.Constants.BLOB_STYLES.SCENE_LEFT : JSPG.Maps.BLOB_STYLE_BY_TYPE[typeDefault]
this.content = ''
this.html = ''
this.log = new Logger(
    JSPG.Logging.ENTITIES.BLOB.id.replace('$id', this.id),
    JSPG.Logging.ENTITIES.BLOB.level
)

this.parseContent = function() {
    // Returns false if content is empty after parsing
    this.log.info('{parseContent}', `Raw content: ${this.rawContent}`)
    let content = this.rawContent

    // Check for interpolation single or multistring
    if (this.rawContent.startsWith("`") && this.rawContent.endsWith("`")) {
        this.log.debug('{parseContent}', `Line is expression to evaluate`)
        content = eval(this.rawContent).trim()
    }
    if (this.rawContent.startsWith(JSPG.Constants.INLINE_EXECUTE_TOKEN)) {
        this.log.debug('{parseContent}', `Line is multiline expression to evaluate`)
        let line = this.rawContent.substr(JSPG.Constants.INLINE_EXECUTE_TOKEN.length)
        content = eval('`{line}`'.format('line', line)).trim()
    }

    if (this.rawContent === '') {
        this.log.debug('{parseContent}', `Line is empty. Skip.`)
        return
    }

    this.content = content
    this.log.debug('{parseContent}', `Non empty line {${this.content}}`)

    const tokens = content.split(JSPG.Constants.INLINE_TOKEN_SEPARATOR)
    this.log.debug('{parseContent}', `Checking for tokens. Tokenized to ${tokens.length} elements`)
    if (tokens.length == 1
        || !tokens[1] == JSPG.Constants.INLINE_TOKEN_SEPARATOR
    ) {
        this.log.debug('{parseContent}', `No tokens found.`)
        return
    }

    const typeToken = tokens[0].toUpperCase()
    const inlineType = JSPG.Maps.BLOB_TYPE_BY_TOKEN[typeToken]
    this.log.debug('{parseContent}', `Prefix token: ${typeToken} of type ${inlineType}`)

    if (inlineType == undefined) {
        this.log.debug('{parseContent}', `Prefix token is unknown. Return untouched content`)
        return
    }

    this.type = inlineType
    this.style = JSPG.Maps.BLOB_STYLE_BY_TYPE[inlineType]
    this.content = tokens.slice(1, tokens.length).join('')
    this.log.debug('{parseContent}', `Content: ${this.content} (style: ${this.style}, type: ${this.type})`)

    // For dialog there may be extra token with image
    if (tokens.length < 3
        || (
            typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_LEFT
            && typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_RIGHT
        )
    ) {
        this.log.debug('{parseContent}', `Is not dialog or missing portrait token...`)
        return
    }

    this.portrait = tokens[1]
    this.content = tokens.slice(2, tokens.length).join('')

    this.log.debug('{parseContent}', `Is dialog token with portrait: ${this.portrait}`)
    this.log.debug('{parseContent}', `Content: ${this.content}`)
}

{
    this.parseContent()
    this.log.debug('{formatHTML}', 'Blob after parsing:')
    this.log.debug('{formatHTML}', `  uid:      ${this.id}`)
    this.log.debug('{formatHTML}', `  Content:  ${this.content}`)
    this.log.debug('{formatHTML}', `  Type:     ${this.type}`)
    this.log.debug('{formatHTML}', `  Style:    ${this.style}`)
    this.log.debug('{formatHTML}', `  Portrait: ${this.portrait}`)

    if (this.content === '' || this.type == JSPG.Constants.BLOB_TYPES.HIDDEN) return

    let portrait_html = ''
    if (this.portrait != ''
        && (
            this.type == JSPG.Constants.BLOB_TYPES.DIALOG_LEFT
            || this.type == JSPG.Constants.BLOB_TYPES.DIALOG_RIGHT
        )
    ) {
        portrait_html = `<img src="${this.portrait}"/>`;
    }

    this.html = `<div class="scene-description ${this.style}" uid="${this.id}">${portrait_html}${this.content}</div>`
}
