const {hashValue, verifyHash} = require("../helpers/hashHelper");
const {dbAction, dbFail, dbSuccess} = require("../helpers/requestHelper");
const {dbSuccessResultWithToken} = require("../helpers/jwtHelper");

module.exports = {
    login: async (req, res) =>{
        const {username, password} = req.body
        const sql = `SELECT * FROM users WHERE username = ?`
        const dbData = await dbAction(sql,  [username])

        if (!verifyHash(password, dbData.result[0].password)){

            return dbFail(res, "Incorrect username or password", 400)
        }

        dbSuccess(res, `User logged in`, dbSuccessResultWithToken(dbData))
    },

    register: async (req, res) =>{
        const {username, password, town, phone} = req.body
        const sql = `INSERT INTO users(username, password, town, phone)
                        VALUES(?,?,?,?)`

        const hashedPass = hashValue(password)
        const dbData = await dbAction(sql, [username, hashedPass, town, phone])

        if (!dbData.isSuccess && dbData.error === `Duplicate entry '${username}' for key 'username'`)
            return dbFail(res, 'username already exists', 401)
        if (!dbData.isSuccess) return dbFail(res, 'error registering user')
        if (dbData.result.affectedRows === 1){
            dbSuccess(res, 'user registered')
        } else {
            dbFail(req, 'error registering user')
        }
    },
}