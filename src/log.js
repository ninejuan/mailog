import * as crypto from 'crypto';

let logData;
let key;
let iv;

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
        }
    }
}

function info(msg) {
    console.log(msg)
}

function error(msg) {
    console.error(msg)
}

function warn(msg) {
    console.warn(msg)
}

function debug(msg) {
    console.debug(msg)
}

function encrypt(pw) {
    console.log(key, iv)
    const enc = crypto.createCipheriv('aes-256-cbc', key, iv);
    let res = enc.update(pw, 'utf8', 'hex');
    res += enc.final('hex');
    return res;
}

function decrypt(pw) {
    const dec = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let res = dec.update(pw, 'hex', 'utf8');
    res += dec.final('utf8');
    return res;
}

export {
    info, error, warn, debug, logInit
}