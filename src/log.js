import * as crypto from 'crypto';
import * as nm from 'nodemailer';
import * as fs from 'fs';
import moment from 'moment-timezone';
import form from './web/mailform.js';
import * as path from 'path';
import { fileURLToPath } from "url";

let logData;
let key;
let iv;

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * 
 * @param {Object} data 
 * @description 로그 모듈을 초기화합니다. / Initializes the log module.
 * @example
 * logInit({
 *      host: "smtp.gmail.com",
 *      port: 465,
 *      svcName: "mailog",
 *      useSecureConnection: true,
 *      auth: {
 *          user: "asdf",
 *          pass: "asdf"
 *      },
 *     sender: "yourmail@yourdomain.com",
 *     receiver: "yourmail@yourdomain.com",
 *     timeZone: "Asia/Seoul"
 * });
 * @see https://nodemailer.com/smtp/
 * @returns {void}
 */
function logInit(data) {
    key = crypto.randomBytes(16).toString('hex');
    iv = crypto.randomBytes(8).toString('hex');
    logData = {
        host: data.host,
        port: data.port,
        svcName: data.svcName,
        useSecureConnection: data.useSecureConnection,
        auth: {
            user: encrypt(data.auth.user),
            pass: encrypt(data.auth.pass)
        },
        sender: encrypt(data.sender),
        receiver: encrypt(data.receiver),
        timeZone: data.timeZone
    }
}

/**
 * 
 * @param {String} msg 
 * @param {Boolean} sendMail
 * @description 일반 로그를 파일에 추가합니다. / Appends GENERAL logs to a file.
 * @returns {void}
 * @example
 * import * as mailog from 'mailog'
 * mailog.info("Hello, world!", true);
 * @see debug
 */
function info(msg, sendMail) {
    let date = new Date();
    appendLogToFile(msg, "INFO", date);
    sendMail ? sendMailLog(msg, "INFO", date).catch(() => { throw new Error("MailogError: Cannot Send Log Mail") }) : null;
}

/**
 * 
 * @param {String} msg 
 * @param {Boolean} sendMail 
 * @description 에러 로그를 파일에 추가합니다. / Appends ERROR logs to a file.
 * @returns {void}
 * @example
 * import * as mailog from 'mailog'
 * mailog.error("Hello, world!", true);
 * @see warn
 */
function error(msg, sendMail) {
    let date = new Date();
    appendLogToFile(msg, "ERROR", date);
    sendMail ? sendMailLog(msg, "ERROR", date).catch(() => { throw new Error("MailogError: Cannot Send Log Mail") }) : null;
}

/**
 * 
 * @param {String} msg 
 * @param {Boolean} sendMail 
 * @description 경고 로그를 파일에 추가합니다. / Appends WARN logs to a file.
 * @returns {void}
 * @example
 * import * as mailog from 'mailog'
 * mailog.warn("Hello, world!", true);
 * @see error
 */
function warn(msg, sendMail) {
    let date = new Date();
    appendLogToFile(msg, "WARN", date);
    sendMail ? sendMailLog(msg, "WARN", date).catch(() => { throw new Error("MailogError: Cannot Send Log Mail") }) : null;
}

/**
 * 
 * @param {String} msg 
 * @param {Boolean} sendMail 
 * @description 디버그 로그를 파일에 추가합니다. / Appends DEBUG logs to a file.
 * @returns {void}
 * @example
 * import * as mailog from 'mailog'
 * mailog.debug("Hello, world!", true);
 * @see info
 */
function debug(msg, sendMail) {
    let date = new Date();
    appendLogToFile(msg, "DEBUG", date);
    sendMail ? sendMailLog(msg, "DEBUG", date).catch(() => { throw new Error("MailogError: Cannot Send Log Mail") }) : null;
}

/**
 * 
 * @param {String} pw - 암호화 전 평문 / Before encryption
 * @returns {String} 암호화된 문자열 / Encrypted string
 * @description 평문을 암호화하여 반환합니다. / Returns the encrypted string.
 * @example
 * const pw = encrypt("ImDecryptedPassword");
 * console.log(pw); // "EncryptedPassword"
 * @see decrypt
 * @see crypto
 * @see https://nodejs.org/api/crypto.html
 */
function encrypt(pw) {
    const enc = crypto.createCipheriv('aes-256-cbc', key, iv);
    let res = enc.update(pw, 'utf8', 'hex');
    res += enc.final('hex');
    return res;
}

/**
 * @param {String} pw - 암호화된 문자열 / Encrypted string
 * @returns {String} 복호화된 평문 / Decrypted string
 * @description 암호화된 문자열을 복호화하여 평문으로 반환합니다. / Decrypts the encrypted string and returns it as plain text.
 * @example
    * const pw = decrypt("EncryptedPassword");
    * console.log(pw); // "ImDecryptedPassword"
 * @see encrypt
 * @see crypto
 * @see https://nodejs.org/api/crypto.html
*/
function decrypt(pw) {
    const dec = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let res = dec.update(pw, 'hex', 'utf8');
    res += dec.final('utf8');
    return res;
}

/**
 * 
 * @param {String} msg 
 * @param {String} level 
 * @param {Date} date
 * @description 로그를 이메일로 전송합니다. / Sends logs to email.
 * @returns {Promise<void>}
 */
async function sendMailLog(msg, level, date) {
    const transporter = nm.createTransport({
        host: logData.host,
        port: logData.port,
        secure: logData.useSecureConnection || true,
        auth: {
            user: await decrypt(logData.auth.user),
            pass: await decrypt(logData.auth.pass)
        }
    });

    // mail form is in ./web/mailform.html
    const sMail = await transporter.sendMail({
        from: decrypt(logData.sender),
        to: decrypt(logData.receiver),
        subject: `[${logData.svcName}] ${level} - ${moment(date).tz(logData.timeZone).format("YYYY-MM-DD HH:mm:ss")}`,
        html: `${form.replace("{{message}}", `${msg}`)
            .replace("{{level}}", level
                .replace("[ERROR]", '<span style="color=red;">[ERROR]</span>')
                .replace("[WARN]", '<span style="color=orange;">[WARN]</span>')
                .replace("[DEBUG]", '<span style="color=yellow;">[DEBUG]</span>')
                .replace("[INFO]", '<span style="color=green;">[INFO]</span>'))
            .replace("{{time}}", moment(date).tz(logData.timeZone).format("YYYY-MM-DD HH:mm:ss"))}`,
    });
}

/**
 * 
 * @param {String} msg 
 * @param {String} level 
 * @param {Date} date 
 * @description 로그를 파일에 추가합니다. / Appends logs to a file.
 * @example
 * appendLogToFile("Hello, world!", "INFO", new Date());
 * @returns {void}
 */
function appendLogToFile(msg, level, date) {
    const logPath = path.join(__dirname, `../log/`);
    !fs.existsSync(logPath) ? fs.mkdirSync(logPath) : null;
    const LevelLogFile = path.join(logPath, `${level}.log`);
    const allLog = path.join(logPath, `ALL.log`);
    const Log = `[${moment(date).tz(logData.timeZone).format("YYYY-MM-DD HH:mm:ss")}] - ${logData.svcName} [${level}] - ${msg}\n`;
    !fs.existsSync(LevelLogFile) ? fs.writeFileSync(LevelLogFile, Log) : fs.appendFileSync(LevelLogFile, Log);
    !fs.existsSync(allLog) ? fs.writeFileSync(allLog, Log) : fs.appendFileSync(allLog, Log);
}

export {
    info, error, warn, debug, logInit
}