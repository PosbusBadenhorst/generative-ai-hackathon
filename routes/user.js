import { Router } from 'express'
import md5 from 'md5'

import isUserAuth from '../middlewares/checkAuth.js'

import imgUrls from '../avatarUrls.js'

import db from '../db.js'

const router = Router()

router.route('/me')
    .get((req, res) => {
        return req.user
    })

router
    .route('/users')
    .get((req, res) => {
        const sql = 'select name, username, id, avatarname, img from user'
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

router.route('/preferences')
    .get((req, res) => {
        const user = req.user

        const data = {
            img: req.query?.img,
            avatarname: req.query?.avatarname,
        }

        const query = `UPDATE user set
            img=? and avatarname=?
        WHERE id=?`

        const params = [data.img, data.avatarname, user.id]
        console.log(params)

        db.run(query, params, function (err, result) {
            if (err) {
                console.error(err)
                return res.status(403).json({ error: res.message })
            }
            return res.redirect('/')
        })
    })

router
    .route('/')
    .get((req, res) => {
        const sql = 'select name, username, id, avatarname, img from user'
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
        if (!req.body.username) {
            errors.push('No username specified')
        }
        if (!req.body.name) {
            errors.push('No readable name specified')
        }
        if (errors.length) {
            return res.status(400).json({ error: errors.join(', ') })
        }
        
        const defaultImg = imgUrls[0]

        const data = {
            name: req.body.name,
            username: req.body.username,
            password: md5(req.body.password),
            img: defaultImg.url,
            avatarname: defaultImg.name,
        }
        console.log('making user: ', data)

        const sql = 'INSERT INTO user (name, username, password, img, avatarname) VALUES (?, ?, ?, ?, ?)'
        const params = [data.name, data.username, data.password, data.img, data.avatarname]

        db.run(sql, params, (err, row) => {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            res.redirect('/')
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
    .put((req, res) => {
        const data = {
            name: req.body?.name,
            username: req.body?.username,
            password: req.body?.password ? md5(req.body.password) : null,
            img: req.body?.img,
            avatarname: req.body?.avatarname,
        }

        const query = `UPDATE user set
            name = COALESCE(?, name)
            username = COALESCE(?, username)
            password = COALESCE(?, password)
            img = COALESCE(?, img)
            avatarname = COALESCE(?, avatarname)
        WHERE id=?`

        const params = [data.name, data.username, data.password, req.params.id]

        db.run(query, params, function (err, result) {
            if (err) {
                return res.status(400).json({ error: res.message })
            }
            return res.json({
                message: 'success',
                changes: this.changes,
                data,
            })
        })
    })
    .delete((req, res) => {
        const query = `DELETE FROM user WHERE id=?`
        const params = [req.params.id]
        
        db.run(query, params, function (err, result) {
            if (err) {
                return res.status(400).json({ error: err.message })
            }
            return res.json({
                message: 'delete successful',
                changes: this.changes,
            })
        })
    })


export default router