import { Configuration, OpenAIApi } from 'openai';
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import * as dotenv from 'dotenv'

import userRouter from './routes/user.js'

import db from './db.js'

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

app.use(bodyParser.json());
app.use(cors());

app.route('/').get((req, res) => res.sendFile(path.join(__dirname, './index.html')))

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