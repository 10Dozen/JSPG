//@wrap:object:JSPG.Screens.AboutScreen

type: JSPG.Constants.SCREENS.TYPES.SIMPLE_TEXT,
title: 'About',
content: [
    `${JSPG.Meta.name}`,
    `by ${JSPG.Meta.author}`,
    `Version ${JSPG.Meta.version}`,
    `Game UID: ${JSPG.Meta.guid}`,
    '',
    `Powered by JSPG version ${JSPG.Meta.JSPGVersion}`
]
