import express from 'express';
let app = express();

import form from './web/mailform.js';
import * as bcrypt from 'bcrypt';
import passport, * as pa from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { fileURLToPath } from "url";
import path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as xss from 'xss';
let ejs = import('ejs');

let webData;
let __dirname = fileURLToPath(new URL(".", import.meta.url));
let secret = crypto.randomBytes(16).toString('hex');

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, '/web/public')));
app.set('views', path.join(__dirname, '/web'));
app.set('view engine', 'ejs');
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

// 로그인 성공 시 실행
passport.serializeUser((auth, done) => {
    done(null, auth.id)
})

passport.deserializeUser((id, done) => {
    done(null, {
        id: id
    })
})

passport.use(new LocalStrategy({
    session: true,
    usernameField: 'id',
    passwordField: 'pw'
}, async (id, pw, done) => {
    // id, pw 값을 webData Obj에 저장된 encrypted string이랑 bcrypt compare
    if (await bcrypt.compareSync(id, webData.auth.user) && await bcrypt.compareSync(pw, webData.auth.pass)) {
        done(null, {
            id: id
        })
    } else {
        done(null, false)
    }
}))

let filter = new xss.FilterXSS({
    whiteList: {
        a: ['br']
    }
})

app.get('/', (req, res) => {
    req.user ? res.render('main', {
        svcname: webData.svcName
    }) : res.redirect('login')
})

app.get('/login', (req, res) => {
    req.user ? res.redirect('/') : res.render('login', {
        svcname: webData.svcName
    })
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}))

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
    });
    res.redirect('/');
})

app.get('/log/:level', checkAuth, (req, res) => {
    let log;
    const readStream = fs.createReadStream(__dirname + `../log/${req?.params?.level ?? "none"}.log`, 'utf-8');
    readStream.on('data', (chunk) => {
        log += filter.process(`${chunk}`.replaceAll(`[T`, `<br>[T`));
    })
    readStream.on('end', () => {
        req.params.level ? res.render(`log`, {
            svcname: webData.svcName,
            level: req.params.level,
            logs: log == undefined ? '로그가 없습니다.' : `${log}`.replaceAll("undefined", "")
        }) : res.redirect('/');
    })
    readStream.on('error', (err) => {
        console.log(err)
        res.redirect('/');
    })
})

app.get('/log/:level/dwnLogs', checkValidAccount, (req, res) => {
    let file = `${process.cwd()}/log/${req?.params?.level ?? "none"}.log`
    res.download(file, (err) => {
        err ? res.json({err: err}) : res.end();
    })
})

function webInit(data) {
    // web.use 값이 true인 상황
    webData = {
        svcName: data.svcname,
        port: data.port || 5001,
        auth: {
            user: data.auth?.user,
            pass: data.auth?.pass,
        }
    }
    start();
}

/**
 * @description 로그 웹 서버를 작동시키는 함수입니다 / This is function that turn on log web server.
 * @returns {void}
 */
function start() {
    app.listen(webData.port, () => {
        console.log(`Mailog: Log Server started at ${webData.port} Port`)
    })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @description 사용자가 로그인된 상태인지 확인하는 모듈입니다 / This is middleware that checks if user logged in to service
 * @returns 
 */
function checkAuth(req, res, next) {
    if (req.isAuthenticated() && req.session) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @description 로그인 된 계정이 유효한 계정인지 확인합니다 / This is middleware that checks user's account is valid
 * @returns
 */
async function checkValidAccount(req, res, next) {
    // GET 방식 API에서 호출하는 방식이다보니 URL만 있으면 호출이 가능하다.
    // 고로, 사용자의 계정이 정상인지 검증하는 과정이 필요하다.
    if (req.isAuthenticated() && await bcrypt.compareSync(req.session.passport.user, webData.auth.user)) return next();
    res.redirect('/login');
}

export {
    webInit
}