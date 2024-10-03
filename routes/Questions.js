const express = require('express')
const router = express()
const Quest = require('../model/Question.js')
const User = require('../model/User.js')
const val = require('../TokenGen')
const topicCheck =  require('../validations/Topic')

router.post('/add-question',async(req,res)=>{
    const  { question, options, correctAnswer, scenarioId } = req.body
    const validTopic = topicCheck(scenarioId)
    if(!validTopic){
        return res.status(400).send({message:'Invalid Topic'})
    }
    const newQuestion = new Quest({
        question:question,
        options:options,
        correctAnswer:correctAnswer,
        scenarioId:validTopic
    })
    try{
        const savedQuestion = await newQuestion.save()
        res.status(200).send({message:'Question has been added',savedQuestion})
    }catch(error){
        res.status(500).send({message:'Error added question\n',error})
    }
})

router.get('/:scenarioId/question',val, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const unansweredQuestions = await Quest.find({
            scenarioId:req.params.scenarioId,
            _id: { $nin: user.answeredQuestions } 

        })
        if (unansweredQuestions.length === 0) {
            return res.status(404).send({ message: 'No unanswered questions found in this section' });
        }
        
        const randomIndex = Math.floor(Math.random() * unansweredQuestions.length)
        const randomQuestion = unansweredQuestions[randomIndex]
        res.status(200).json(randomQuestion)
    } catch (error) {
        res.status(500).send({ message: 'Error fetching questions', error })
    }
})
module.exports = router
