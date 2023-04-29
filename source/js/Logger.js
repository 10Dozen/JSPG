const Logger = function (component, level=2) {
    this.LOG_LEVELS = {
        ERROR: 0,
        WARNING: 1,
        INFO: 2,
        DEBUG: 3
    }
    this.LOG_LEVEL_SUFFIX = {
        0: 'ERR',
        1: 'WARN',
        2: 'INFO',
        3: 'DBG'
    }

    this.level = level
    this.prefix = component

    this.getMsgPrefix = function (lvl) {
        return `[JSPG/${this.prefix}](${this.LOG_LEVEL_SUFFIX[lvl]})`
    }

    this.isLogLevelAllowed = function (lvlToCheck) {
        return lvlToCheck <= this.level
    }

    this.err = function (...msg) {
        const lvl = this.LOG_LEVELS.ERROR
        if (!this.isLogLevelAllowed(lvl)) return
        console.error(this.getMsgPrefix(lvl), ...msg)
    }

    this.warn = function (...msg) {
        const lvl = this.LOG_LEVELS.WARNING
        if (!this.isLogLevelAllowed(lvl)) return
        console.warn(this.getMsgPrefix(lvl), ...msg)
    }

    this.info = function (...msg) {
        const lvl = this.LOG_LEVELS.INFO
        if (!this.isLogLevelAllowed(lvl)) return
        console.log(this.getMsgPrefix(lvl), ...msg)
    }

    this.debug = function (...msg) {
        const lvl = this.LOG_LEVELS.DEBUG
        if (!this.isLogLevelAllowed(lvl)) return
        console.log(this.getMsgPrefix(lvl), ...msg)
    }
}
