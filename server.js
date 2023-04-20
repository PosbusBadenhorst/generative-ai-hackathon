import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import session from 'express-session'
import md5 from 'md5'
import morgan from 'morgan'
import path from 'path'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import { Configuration, OpenAIApi } from 'openai';

import * as dotenv from 'dotenv'

import isUserAuth from './middlewares/checkAuth.js'

import userRouter from './routes/user.js'

import db from './db.js'

morgan(':method :url :status :res[content-length] - :response-time ms')

dotenv.config()

const __dirname = path.resolve(path.dirname(''));

const configuration = new Configuration({
    organization: process.env.ORGINISATION,
    apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
const port = 3000;
const model = 'gpt-3.5-turbo'

app.use(express.static('./'))

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use(cors());

app.set('view engine', 'ejs');

app.use(session(({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
})))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(async function (username, password, done) {
    console.log(username, password)
    db.get(
        'SELECT * FROM user WHERE username = ?',
        [username],
        function (err, row) {
            console.log(err, row)
            if (!row) {
                console.log('user not found')
                return done(null, false)
            }
            const pwd = md5(password)
            console.log('comparing user password to pwd: ', row.password, pwd)
            // WARNING: Do not use this in production. Use a package like cryptography to compare passwords.
            if (pwd !== row.password) {
                console.log('passwords dont match')
                return done(null, false)
            }
            console.log('passwords match, user authenticated', row)
            return done(null, row)
        }
    )
}))

passport.serializeUser(function (user, done) {
    return done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
    console.log('deserialise', id)
    db.get(
        `SELECT * FROM user WHERE id = ?`,
        [id],
        function (err, row) {
            console.log(err, row)
            if (!row) {
                console.log('user not found')
                return done(null, false, { error: err })
            }
            console.log('user found')
            return done(null, row)
        }
    )
})

app.route('/').get(isUserAuth, (req, res) => {
    console.log(req.user)
    return res.render('index', { user: req.user })
})

app.route('/login')
    .get((req, res) => res.sendFile(path.join(__dirname, './views/login.html')))
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }))

app.route('/video')
    .get((req, res) => res.sendFile(path.join(__dirname, './views/video.html')))
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }))

app.route('/logout')
    .get((req, res) => {
        return req.logout(() => res.redirect('/'))
    })

app.post('/prompt', isUserAuth, async (req, res) => {

    const { messages } = req.body
    
    const completion = await openai.createChatCompletion({
        model,
        messages: [
            {
                role: 'system',
                content: 'You are a Financial Advisor Bot called Hall.'
            },
            {
                role: 'system',
                content: 'You seek to improve customer satisfaction.'
            },
            ...messages,
        ]
    })
    console.log(completion.data.choices[0].message)

    res.json({
        completion: completion.data.choices[0].message
    })

});

app.use('/user', userRouter)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});