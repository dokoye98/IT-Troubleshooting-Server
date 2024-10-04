const jwt = require('jsonwebtoken')

function authenticate(req,res,next){
    const token = req.header('auth-token')
    if(!token){
        return res.status(401).send({message:'Access Denied'})
    }
    try{
        const verified = jwt.verify(token,process.env.TOKEN)
        req.user = verified
        next()
    }catch(err){
        return res.status(401).send({ message: 'Invalid Token' })
    }
}
module.exports = authenticate