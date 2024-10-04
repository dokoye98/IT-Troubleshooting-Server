const express = require('express')
const router = express()
const Quest = require('../model/Question.js')
const User = require('../model/User.js')
const val = require('../TokenGen')
const topicCheck =  require('../validations/Topic')
const setting = require('../validations/Difficult.js')

router.post('/add-question',async(req,res)=>{
    const  { question, options, correctAnswer, scenarioId,difficulty ,hint} = req.body
    const validTopic = topicCheck(scenarioId)
    if(!validTopic){
        return res.status(400).send({message:'Invalid Topic'})
    }
    const validSetting = setting(difficulty)
    if(!validSetting){
        return res.status(400).send({message:'Invalid Setting'})
    }
    const newQuestion = new Quest({
        question:question,
        options:options,
        correctAnswer:correctAnswer,
        scenarioId:validTopic,
        difficulty:validSetting,
        hint:hint
    })
    try{
        const savedQuestion = await newQuestion.save()
        res.status(200).send({message:'Question has been added',savedQuestion})
    }catch(error){
        res.status(500).send({message:'Error added question\n',error})
    }
})

router.post('/submit-answer',val,async(req,res)=>{
    try{
        const {questionId,selectedAnswer} = req.body

        const question = await Quest.findById(questionId)
        if(!question){
            return res.status(404).send({message:'Question not found'})
        }
        const isCorrect = question.correctAnswer === selectedAnswer
        const user = await User.findById(req.user._id)
        if (!user.answeredQuestions.includes(questionId)) {
            user.answeredQuestions.push(questionId)
            await user.save()
        }
        res.status(200).send({
            success: isCorrect,
            message: isCorrect ? 'Correct answer!' : `Wrong answer. The correct answer is ${question.correctAnswer}`
        })
      }catch(error){
        res.status(500).send({ message: 'Error submitting answer', error })
      }
})


router.get('/:scenarioId/:difficulty',val,(async(req,res)=>{
    try{
        const {numQuestions} = req.query
        const user = await User.findById(req.user._id)

        const unansweredQuestions = await Quest.find({
            scenarioId: req.params.scenarioId,
            difficulty: req.params.difficulty,
            _id: { $nin: user.answeredQuestions } 
        })

        if (unansweredQuestions.length === 0) {
            return res.status(404).send({ message: 'No unanswered questions found for this scenario and difficulty level' })
        }
        const limitedQuestions = unansweredQuestions.slice(0, Math.min(unansweredQuestions.length, numQuestions))
        res.status(200).json(limitedQuestions)
    
    }catch(error){
        res.status(500).send({ message: 'Error fetching questions', error })
    }
}))
module.exports = router
