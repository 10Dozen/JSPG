//@wrap:function:JSPG.Entities.Blob:content, portrait_html, style, debugInfo=''

this.id = JSPG.uid()
this.debugInfo = `<span class="scene-debug-info"><i>${debugInfo.join('<br>')}</i></span>`
this.html = `<div class="scene-description ${style}" uid="${this.id}">${this.debugInfo}${portrait_html}${content}</div>`
