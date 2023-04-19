import { Router } from 'express'

import db from '../db.js'

const router = Router()

router
    .route('/users')
    .get((req, res) => {
        const sql = 'select name, email, id from user'
        db.get(sql, [], (err, rows) => {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.json({
                message: 'success',
                data: rows,
            })
        })
    })

router
    .route('/:id')
    .get((req, res) => {
        const sql = 'select * from user where id=?'
        const params = [req.params.id]
        db.get(sql, params, (err, row) => {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.json({
                message: 'success',
                data: row,
            })
        })
    })

router
    .route('/')
    .get((req, res) => {
        const sql = 'select name, email, id from user'
        db.get(sql, [], (err, rows) => {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.json({
                message: 'success',
                data: rows,
            })
        })
    })
    .post((req, res) => {
        const errors = []

        if (!req.body.password) {
            errors.push('No password specified')
        }
        if (!req.body.email) {
            errors.push('No email specified')
        }
        if (errors.length) {
            return res.status(400).json({ error: errors.join(', ') })
        }

        const data = {
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password)
        }

        const sql = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)'
        const params = [data.name, data.email, data.password]

        db.run(sql, params, (err, row) => {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.json({
                message: 'success',
                data: row,
            })
        })
    })

export default router