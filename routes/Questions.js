const express = require('express')
const router = express()
const Quest = require('../model/Question.js')
const User = require('../model/User.js')
const validateToken = require('../TokenGen')
const topicCheck =  require('../validations/Topic')
const setting = require('../validations/Difficult.js')

router.post('/add-question',async(req,res)=>{
    const  { question, options, correctAnswer, scenarioId, difficulty, hint } = req.body
    const validTopic = topicCheck(scenarioId)
    if(!validTopic){
        return res.status(400).send({message:'Invalid Topic'})
    }
    const validSetting = setting(difficulty)
    if(!validSetting){
        return res.status(400).send({message:'Invalid Setting'})
    }
    const newQuestion = new Quest({
        question,
        options,
        correctAnswer,
        scenarioId: validTopic,
        difficulty: validSetting,
        hint
    })
    try{
        const savedQuestion = await newQuestion.save()
        res.status(200).send({message:'Question has been added', savedQuestion})
    }catch(error){
        res.status(500).send({message:'Error adding question', error})
    }
})

router.post('/add-questions', async (req, res) => {
    const { questions } = req.body
    if (!Array.isArray(questions)) {
        return res.status(400).send({ message: 'Invalid data format, expected an array of questions' })
    }
    const validQuestions = []
    const invalidQuestions = []
    for (const questionData of questions) {
        const { question, options, correctAnswer, scenarioId, difficulty, hint } = questionData
        const validTopic = topicCheck(scenarioId)
        if (!validTopic) {
            invalidQuestions.push({ question, message: 'Invalid Topic' })
            continue
        }
        const validSetting = setting(difficulty)
        if (!validSetting) {
            invalidQuestions.push({ question, message: 'Invalid Setting' })
            continue
        }
        const newQuestion = new Quest({
            question,
            options,
            correctAnswer,
            scenarioId: validTopic,
            difficulty: validSetting,
            hint
        })
        try {
            const savedQuestion = await newQuestion.save()
            validQuestions.push(savedQuestion)
        } catch (error) {
            invalidQuestions.push({ question, message: 'Error saving question', error })
        }
    }
    if (invalidQuestions.length > 0) {
        return res.status(207).send({ message: 'Some questions could not be added', validQuestions, invalidQuestions })
    }
    console.log(`Finished here with ${validQuestions.length} questions`)
    res.status(200).send({ message: 'All questions have been added successfully', validQuestions })
})

router.post('/submit-answer',validateToken,async(req,res)=>{
    try{
        const user = await User.findById(req.user._id)
        console.log(user.username)
        const { questionId, selectedAnswer } = req.body
        const question = await Quest.findById(questionId)
        if(!question){
            return res.status(404).send({message:'Question not found'})
        }
        const isCorrect = question.correctAnswer === selectedAnswer
        if(isCorrect){
            user.LevelPoints += 1
            user.answeredquestions.push(questionId)
            console.log(user.LevelPoints)
        }
        if (!user.answeredquestions.includes(questionId)) {
            user.answeredquestions.push(questionId)
        }
        res.status(200).send({
            success: isCorrect,
            message: isCorrect ? 'Correct answer!' : `Wrong answer. The correct answer is ${question.correctAnswer}`
        })
    }catch(error){
        res.status(500).send({ message: 'Error submitting answer', error })
    }
})

router.get('/:scenarioId/:difficulty/:numOfQuestions',validateToken,async(req,res)=>{
    const topic = req.params.scenarioId
    const difficulty = req.params.difficulty
    const numOfQuestions = parseInt(req.params.numOfQuestions)
    console.log(typeof numOfQuestions)
    try{
        const user = await User.findById(req.user._id)
        console.log(user.username)
        const topicQuestion = await Quest.find({scenarioId:topic})
        if (!topicQuestion || topicQuestion.length === 0) {
            return res.status(404).send({ message: 'No questions for this topic' })
        }
        const topicDifficulty = topicQuestion.filter(q => 
            q.difficulty === difficulty && 
            Array.isArray(user.answeredquestions) && 
            !user.answeredquestions.includes(q._id)
        )
        if (!topicDifficulty || topicDifficulty.length === 0) {
            return res.status(404).send({ message: 'No questions for this difficulty' })
        }
        const limitedQuestions = topicDifficulty.slice(0, Math.min(topicDifficulty.length, numOfQuestions))
        if (limitedQuestions.length === 0) {
            return res.status(404).send({ message: 'No questions available after slicing' })
        }
        console.log('check4')
        res.status(200).json(limitedQuestions)
    }catch(error){
        console.log(error)
        res.status(500).send({message:error.message})
    }
})

module.exports = router
