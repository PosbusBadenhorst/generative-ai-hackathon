import sqlite3 from 'sqlite3'

const DB_NAME = 'db.sqlite'

const db = new sqlite3.Database(DB_NAME, err => {
    if (err) {
        console.error(err.message)
        throw err
    }
})

export default db