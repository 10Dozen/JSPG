//@wrap:closure:JSPG.BlobBuilder:

this.log = new Logger(
    JSPG.Logging.BLOB_BUILDER.id,
    JSPG.Logging.BLOB_BUILDER.level
)

this.createBlobsFrom = function (entity) {
    let debugContent = null
    if (JSPG.Debug.enable_scene_debug_info) {
        debugContent = [`<b>${entity.name}</b> (${entity.debugName}, ${entity.type})`]
        if (entity.debugName == 'scene') {
            if (entity.actions.length > 0) debugContent.push(`${entity.actions.length} action(s)`)
            if (entity.pre_exec) debugContent.push(`<i title="${entity.pre_exec}">➥ pre_exec`)
            if (entity.post_exec) debugContent.push(`<i title="${entity.post_exec}">➥ post_exec</i>`)
        } else {
            if (entity.tag) debugContent.push(`#${entity.tag}`)
            if (entity.exec) debugContent.push(`<i title="${entity.exec}">➥ exec</i>`)
        }

        if (entity.goto) {
            debugContent.push(
                typeof entity.goto === typeof ''
                ? `<i>goto ▸ ${entity.goto}`
                : `<i title="target=${entity.goto}">➥ goto`
            )
        }
    }

    const contentfullBlobs = []
    for (let i = 0; i < entity.desc.length; ++i) {
        const blob = this._createBlob(
            entity.type,
            entity.portrait,
            entity.desc[i],
            debugContent, i
        )
        if (!blob) continue

        contentfullBlobs.push(blob)
    }

    return contentfullBlobs
}

this._createBlob = function (typeDefault, portraitDefault, content, debugContent, index) {
    const parsed = this._parseContent(content)

    const type = parsed.hasOwnProperty('type')
                 ? parsed.type
                 : typeDefault
    if (!parsed || type == JSPG.Constants.BLOB_TYPES.HIDDEN) return null

    const style = typeDefault
                  ? JSPG.Maps.BLOB_STYLE_BY_TYPE[type]
                  : JSPG.Constants.BLOB_STYLES.SCENE_LEFT

    const portrait = JSPG.parseParamValue(
                        parsed.hasOwnProperty('portrait')
                        ? parsed.portrait
                        : portraitDefault
                    )

    const portrait_html = portrait
                          && (
                              type === JSPG.Constants.BLOB_TYPES.DIALOG_RIGHT
                              || type === JSPG.Constants.BLOB_TYPES.DIALOG_LEFT
                          )
                          ? `<img src="${portrait}" />`
                          : ''

   let debugInfo = null
   if (debugContent) {
       debugInfo = [
           ...debugContent,
           `Blob Idx=${index}, type=${type}${portrait ? ', portrait=' + portrait : ''}`
       ]
   }

   return new JSPG.Entities.Blob(parsed.content, portrait_html, style, debugInfo)
}

this._parseContent = function (rawContent) {
    /* Returns object of format:
       {
          content: (string),            - parsed content
          type: (optional, string),     - type parsed out from inline token
          portrait: (optional, string)  - portrait parsed out from inline token
       }
     */
    this.log.info('{parseContent}', `Raw content: ${rawContent}`)

    if (rawContent === '') {
        this.log.debug('{parseContent}', `Line is empty. Skip.`)
        return null
     }

    let content = rawContent
    // Check for interpolation single or multistring
    if (rawContent.startsWith("`") && rawContent.endsWith("`")) {
        this.log.debug('{parseContent}', `Line is expression to evaluate`)
        content = eval(rawContent).trim()
    } else if (rawContent.startsWith(JSPG.Constants.INLINE_EXECUTE_TOKEN)) {
        this.log.debug('{parseContent}', `Line is multiline expression to evaluate`)
        const line = rawContent.substr(JSPG.Constants.INLINE_EXECUTE_TOKEN.length)
        content = eval('`{line}`'.format('line', line)).trim()
    }

    if (content === '') {
        this.log.debug('{parseContent}', `Parsed line is empty. Skip from render.`)
        return null
    }
    this.log.debug('{parseContent}', `Non empty line {${content}}`)

    const parsed = {
        content: content
    }

    // Check for inline tokens
    const tokens = content.split(JSPG.Constants.INLINE_TOKEN_SEPARATOR)
    this.log.debug('{parseContent}', `Checking for tokens. Tokenized to ${tokens.length} element(s)`)
    if (
        tokens.length == 1
        || !tokens[1] == JSPG.Constants.INLINE_TOKEN_SEPARATOR
    ) {
        this.log.debug('{parseContent}', `No tokens found.`)
        return parsed
    }

    const typeToken = tokens[0].toUpperCase()
    const inlineType = JSPG.Maps.BLOB_TYPE_BY_TOKEN[typeToken]
    this.log.debug('{parseContent}', `Prefix token: ${typeToken} of type ${inlineType}`)

    if (inlineType == undefined) {
        this.log.debug('{parseContent}', `Prefix token is unknown. Return untouched content`)
        return parsed
    }

    parsed.type = inlineType
    parsed.content = tokens.slice(1, tokens.length).join('')
    this.log.debug('{parseContent}', `Content: ${parsed.content.length} chars, type: ${parsed.type}`)

    // For dialog there may be extra token with image
    if (tokens.length < 3
        || (
            typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_LEFT
            && typeToken != JSPG.Constants.INLINE_TOKENS_TYPES.DIALOG_RIGHT
        )
    ) {
        this.log.debug('{parseContent}', `Is not dialog or missing portrait token...`)
        return parsed
    }

    parsed.portrait = tokens[1]
    parsed.content = tokens.slice(2, tokens.length).join('')

    this.log.debug('{parseContent}', `Is dialog token with portrait: ${parsed.portrait}`)
    this.log.debug('{parseContent}', `Content: ${parsed.content.length} chars`)
    return parsed
}
