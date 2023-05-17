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

import avatarUrls from './avatarUrls.js'

import db from './db.js'

dotenv.config()

const PORT = 3000;
const MODEL = 'gpt-3.5-turbo'

const __dirname = path.resolve(path.dirname(''));

const configuration = new Configuration({
    organization: process.env.ORGINISATION,
    apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();

app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
)

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
    db.get(
        'SELECT * FROM user WHERE username = ?',
        [username],
        function (err, row) {
            if (!row) {
                return done(null, false)
            }
            const pwd = md5(password)
            // WARNING: Do not use this in production. Use a package like cryptography to compare passwords.
            if (pwd !== row.password) {
                return done(null, false)
            }
            const user = {
                name: row.name,
                username: row.username,
                id: row.id,
                img: row.img,
                avatarname: row.avatarname,
            }
            return done(null, user)
        }
    )
}))

passport.serializeUser(function (user, done) {
    return done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
    db.get(
        `SELECT name, username, img, avatarname, id FROM user WHERE id = ?`,
        [id],
        function (err, row) {
            if (!row) {
                return done(null, false, { error: err })
            }
            return done(null, row)
        }
    )
})

app.route('/').get(isUserAuth, (req, res) => {
    return res.render('index', { user: req.user, avatarUrls, })
})

app.route('/d-id')
    .get((req, res) => {
        return res.json({
            "key": process.env.D_ID_KEY,
            "url": "https://api.d-id.com"
          })
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
        failureRedirect: '/login',
    }))

app.route('/logout')
    .get((req, res) => {
        return req.logout(() => res.redirect('/'))
    })

app.post('/prompt', isUserAuth, async (req, res) => {
    try {
        const { messages } = req.body
        
        const completion = await openai.createChatCompletion({
            MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a Financial Advisor Bot called NatWest EASE.'
                },
                {
                    role: 'system',
                    content: 'you are a chat bot. Your purpose is to support customers of NatWest group both personal, premier, business and corporates and institutions. You are here to provide financial support and advice and if needed will refer to the information on the NatWest web page for available support and products and rates. These are the web links https://www.natwest.com/. please note that responses cannot be more than 3500 characters long.'
                },
                ...messages,
            ]
        })
    
        res.json({
            completion: completion.data.choices[0].message
        })
    } catch (err) {
        res.status(err.response.status).json({
            completion: {
                content: `Unfortunately something went wrong with your request: ${err.message}`,
            },
        })
    }

});

app.use('/user', userRouter)

app.listen(PORT, () => {
    console.log(`Server initialised on PORT ${PORT}. Available at http://localhost:${PORT}`);
});