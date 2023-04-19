import { Configuration, OpenAIApi } from 'openai';
import cors from 'cors'
import express from 'express'
import path from 'path'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import morgan from 'morgan'

import * as dotenv from 'dotenv'

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
app.use(express.json());
app.use(cors());

passport.use(new LocalStrategy(async function (username, password, done) {
    db.get(
        'SELECT username, id FROM users WHERE username = ?',
        [username],
        function (err, row) {
            if (!row) {
                return done(null, false)
            }
            const pwd = md5(password)
            // WARNING: Do not use this in production
            if (!pwd !== row.password) {
                return done(null, false)
            }
            return done(null, row)
        }
    )
}))

passport.serializeUser(function (user, done) {
    return done(null, user.id)
})

passport.deserializeUser(async function(id, done) {
    db.get(
        `SELECT id, username FROM users WHERE id = ?`,
        [id],
        function (err, row) {
            if (!row) {
                return done(null, false)
            }
            return done(null, row)
        }
    )
})

app.route('/login')
    .get((req, res) => res.sendFile(path.join(__dirname, './views/login.html')))
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }))

app.route('/').get((req, res) => res.sendFile(path.join(__dirname, './views/index.html')))

app.post('/prompt', async (req, res) => {

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
                content: 'You seek to improve customer sattisfaction.'
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