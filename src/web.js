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
        log += `${chunk}`.replaceAll(`[${req.params.level}]`, `<br>[${req.params.level}]`);
    })
    readStream.on('end', () => {
        console.log(log);
        req.params.level ? res.render(`log`, {
            svcname: webData.svcName,
            level: req.params.level.replace("ERROR", '<p style="color:#FF0000;font-weight:bolder;">[ERROR]</p>')
                .replace("WARN", '<p style="color:#FF8C00;font-weight:bolder;">[WARN]</p>')
                .replace("DEBUG", '<p style="color:#FFD700;font-weight:bolder;">[DEBUG]</p>')
                .replace("INFO", '<p style="color:#32CD32;font-weight:bolder;">[INFO]</p>'),
            logs: log !== undefined ? log : '로그가 없습니다.'
        }) : res.redirect('/');
    })
    readStream.on('error', (err) => {
        console.log(err)
        res.redirect('/');
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
            captcha: data.auth?.captcha // Boolean
        }
    }
    start();
}

function start() {
    app.listen(webData.port, () => {
        console.log(`Mailog: Log Server started at ${webData.port} Port`)
    })
}

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
}

export {
    webInit
}