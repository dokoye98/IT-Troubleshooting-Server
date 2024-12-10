const express = require('express')
const User = require('../model/User')
const router = express()
const {signUpValidation,loginValidation} = require('../validations/valid')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const validationToken = require('../TokenGen')

router.post('/signup',async(req,res)=>{
    const {error} = signUpValidation(req.body)
    if(error){
        console.log({message:error['details'][0]['message']})
        return res.status(400).send({message:error['details'][0]['message']}) 
    }
    const userCheck = await User.findOne({username:req.body.username})
    if(userCheck){
        return res.status(400).send({message:' Username is already in use'})
    }
    const salt = await bcryptjs.genSalt(10)
    const hashpassword = await bcryptjs.hash(req.body.password,salt)
    const dataFormat = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
       
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
    const accessToken = jsonwebtoken.sign({_id:userNameCheck._id},process.env.TOKEN_KEY, { expiresIn: '3h' })
    res.header('Authorization', `Bearer ${accessToken}`).send({ 'auth-token': accessToken })
    console.log('User has signed in', userNameCheck.username )
})

router.get('/account', validationToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'answeredquestions',
            populate: {
                path: 'topic',
                select: 'name' 
            }
        })
        console.log()
        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }

        const groupedQuestions = user.answeredquestions.reduce((acc, question) => {
            const topicName = question.topic.name; 
            if (!acc[topicName]) {
                acc[topicName] = [];
            }
            acc[topicName].push(question);
            return acc;
        }, {});

        return res.status(200).send({
            User: user,
            answeredQuestions: groupedQuestions
        })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

router.patch('/reset-account', validationToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }

        user.LevelPoints = 0
        user.answeredquestions = []

        await user.save()

        return res.status(200).send({ message: 'Account reset successfully' })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})


module.exports = router