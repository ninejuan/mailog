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
    console.log('serializeUser')
    done(null, auth.id)
})

passport.deserializeUser((id, done) => {
    console.log('deserializeUser')
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
        console.log(id, pw, 'failed')
        console.log(webData.auth.user, webData.auth.pass, 'default Data')
        done(null, false)
    }
}))

app.get('/', (req, res) => {
    req.user ? res.render('main') : res.redirect('login')
})

app.get('/login', (req, res) => {
    req.user ? res.redirect('/') : res.render('login')
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

app.get(`/log`, import(__dirname + '/web/middleware/checkAuth'), (req, res) => {
    req.params.level ? res.render(`log`, {
        log: form.log
    }) : res.render('logList')
})

function base64Decode(data) {
    return Buffer.from(data, 'base64').toString('utf-8');
}

function webInit(data) {
    // web.use 값이 true인 상황
    webData = {
        port: data.port || 5001,
        auth: {
            user: data.auth?.user ? bcrypt.hashSync(base64Decode(data?.auth?.user), 10) : bcrypt.hashSync(base64Decode("admin"), 10),
            pass: data.auth?.pass ? bcrypt.hashSync(base64Decode(data.auth.pass), 10) : bcrypt.hashSync(base64Decode("admin"), 10),
            captcha: data.auth?.captcha || true // Boolean
        }
    }
    start();
}

function start() {
    app.listen(webData.port, () => {
        console.log(`Mailog: Log Server started at ${webData.port} Port`)
    })
}

export {
    webInit
}