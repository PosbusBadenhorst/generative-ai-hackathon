import md5 from 'md5'

import db from './db.js' 

db.run(
    `CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name text,
        username text UNIQUE,
        password text,
        CONSTRAINT username_unique UNIQUE (username)
    )`,
    err => {
        if (err) {
            console.log('...table already exists')
            console.error(err.message)
        } else {
            console.log('...table created')
            const insert = `INSERT INTO user (name, username, password) VALUES (?, ?, ?)`
            db.run(insert, ['admin', 'admin', md5('admin123455')])
            db.run(insert, ['user', 'testuser', md5('user123455')])
        }
    }
)
