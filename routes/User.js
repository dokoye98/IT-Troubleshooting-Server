const express = require('express')
const User = require('../model/User')
const router = express()
const {signUpValidation,loginValidation} = require('../validations/valid')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

router.post('/signup',async(req,res)=>{
    const {error} = signUpValidation(req.body)
    if(error){
        console.log({message:error['details'][0]['message']})
        return res.status(400).send({message:error['details'][0]['message']}) 
    }
    const emailCheck = await User.findOne({email:req.body.email})
    const userCheck = await User.findOne({username:req.body.username})
    if(emailCheck || userCheck){
        return res.status(400).send({message:'Email or Username is already in use'})
    }
    const salt = await bcryptjs.genSalt(10)
    const hashpassword = await bcryptjs.hash(req.body.password,salt)
    const dataFormat = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: hashpassword
    })
    try{
        const newUser = await dataFormat.save()
        console.log('new user added')
        return res.status(200).send({message:'SignUp complete',newUser})
    }catch(error){
        return res.status(400).send({message:error})
    }
})

router.post('/login',async(req,res)=>{
    const {error} = loginValidation(req.body)
    if(error){
        console.log({message:error['details'][0]['message']})
        return res.status(400).send({message:error['details'][0]['message']}) 
    }
    

    const userNameCheck = await User.findOne({username:req.body.username})
    if(!userNameCheck){
        return res.status(400).send({message:'Account does not exist'})
    }
    const passwordCheck  = await bcryptjs.compare(req.body.password,userNameCheck.password)
    if(!passwordCheck){
        return res.status(400).send({message:'Incorrect password'})
    }
    const accessToken = jsonwebtoken.sign({_id:userNameCheck._id},process.env.TOKEN_KEY, { expiresIn: '5h' })
    res.header('Authorization', `Bearer ${accessToken}`).send({ 'auth-token': accessToken })
    console.log('User has signed in', userNameCheck.username )
})



module.exports = router