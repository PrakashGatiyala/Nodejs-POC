const jwt = require('jsonwebtoken')

const JWT_SECRET = "PeRi$2@24"

function createToken(payload){
    const token =  jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'})
    return token;
}

function verifyToken(token){
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        return payload;
    }
    catch (err){
        return null
    }
}

module.exports = { createToken, verifyToken }