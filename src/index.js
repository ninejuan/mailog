/**
 * @author Juan Lee
 * @since 2023-07-01
 * @description index.js
 */

const {info, error, warn, debug} = require('./log.js');
const {init} = require('./init.js');

module.exports = {
    info,
    error,
    warn,
    debug,
    init
}