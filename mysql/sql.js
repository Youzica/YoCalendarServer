const mysql = require('mysql')

const db = mysql.createPool({
    host:'127.0.0.1',
    port:'3303',
    user:'root',
    password:'1234',
    database:'list'
})

module.exports = db