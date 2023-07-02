import * as webLauncher from './web.js'
import { logInit } from './log.js';
import { webInit } from './web.js';
import * as bcrypt from 'bcrypt'

/**
 * @param {Object} log
 * @param {Object} web
 * @returns {void}
 */

export function init(log, web) {
    if (!log.host || !log.port || !log.svcName || !log.auth.user || !log.auth.pass || !web) {
        throw new Error("Invalid parameters");
    }
    logInit({
        host: log.host,
        port: log.port,
        svcName: log.svcName,
        useSecureConnection: log.useSecureConnection || true,
        auth: {
            user: log.auth.user,
            pass: log.auth.pass
        }
    });
    web.use ? webInit({
        port: web.port || 5001,
        auth: {
            user: web.auth.user ? bcrypt.hashSync(web.auth.user, 10) : bcrypt.hashSync("admin", 10),
            pass: web.auth.pass ? bcrypt.hashSync(web.auth.pass, 10) : bcrypt.hashSync("admin", 10),
            captcha: web.auth.captcha || true // Boolean
        }
    }) : null;
}