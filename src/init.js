import * as webLauncher from './web.js'
import { logInit } from './log.js';
import { webInit } from './web.js';
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

/**
 * @param {Object} log
 * @param {String} log.host
 * @param {Number} log.port
 * @param {String} log.svcName
 * @param {Boolean} log.useSecureConnection
 * @param {Object} log.auth
 * @param {String} log.auth.user
 * @param {String} log.auth.pass
 * @param {String} log.receiver
 * @param {String} log.timeZone
 * @param {Object} web
 * @param {Boolean} web.use
 * @param {Number} web.port
 * @param {Object} web.auth
 * @param {String} web.auth.user
 * @param {String} web.auth.pass
 * @param {Boolean} web.auth.captcha
 * @description Initialize mailog
 * @example
 * import * as mailog from 'mailog'
 * @example
 * import * as mailog from 'mailog'
 * mailog.init({
 *      host: "smtp.gmail.com",
 *      port: 465,
 *      svcName: "mailog",
 *      useSecureConnection: true,
 *      auth: {
 *          id: "asdf",
 *          pass: "asdf"
 *      },
 *      sender: "yourmail@yourdomain.com"
 *      receiver: "yourmail@yourdomain.com",
 *      timeZone: "Asia/Seoul"
 *  }, {
 *      use: true, // or false
 *      port: 5001,
 *      auth: {
 *          user: "asdf",
 *          pass: "asdf",
 *          captcha: true // or false
 *      }
 * });
 * @returns {void}
 */

function base64Encode(str) {
    return Buffer.from(str).toString('base64');
}

export function init(log, web) {
    if (!log.host || !log.port || !log.svcName || !log.auth.user || !log.auth.pass || !log.sender || !log.receiver || !web) {
        throw new Error("Invalid parameters");
    }
    logInit({
        host: log.host,
        port: log.port,
        useSecureConnection: log.useSecureConnection || true,
        auth: {
            user: log.auth.user,
            pass: log.auth.pass
        },
        svcName: log.svcName,
        sender: log.sender,
        receiver: log.receiver,
        timeZone: log.timeZone || "Asia/Seoul"
    });
    web.use ? webInit({
        port: web.port || 5001,
        auth: {
            user: web.auth?.user ? base64Encode(web?.auth?.user) : base64Encode("admin"),
            pass: web.auth?.pass ? base64Encode(web.auth.pass) : base64Encode("admin"),
            captcha: web.auth?.captcha || true // Boolean
        }
    }) : null;
}