import md5 from 'md5'

import db from './db' 

db.run(
    `CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name text,
        email text UNIQUE,
        password text,
        CONSTRAINT email_unique UNIQUE (email)
    )`,
    err => {
        if (err) {
            console.log('...table already exists')
            console.error(err.message)
        } else {
            console.log('...table created')
            const insert = `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`
            db.run(insert, ['admin', 'adming@example.com', md5('admin123455')])
            db.run(insert, ['user', 'user@example.com', md5('user123455')])
        }
    }
)
