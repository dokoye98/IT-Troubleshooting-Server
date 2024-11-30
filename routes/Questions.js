const express = require('express')
const router = express()
const Quest = require('../model/Question.js')
const Category = require('../model/Category.js')
const Topic = require('../model/Topic.js')
const User = require('../model/User.js')
const validateToken = require('../TokenGen')
const topicCheck = require('../validations/Topic')
const setting = require('../validations/Difficult.js')
const Data  = require('../model/QuestionData.js')



router.post('/add-category', async (req, res) => {
    try {
        const name = req.body.name
        const newCategory = new Category({ name })
        const savedCategory = await newCategory.save()
        
        res.status(200).send({ message: 'Category added', savedCategory })
    } catch (err) {
        return res.status(500).send({ message: err })
    }
})

router.post('/add-question', async (req, res) => {
    const { question, options, correctAnswer, topicId, difficulty, hint } = req.body

    try {
        const validTopic = await Topic.findById(topicId)
        if (!validTopic) {
            return res.status(400).send({ message: 'Invalid Topic' })
        }

        const validSetting = setting(difficulty)
        if (!validSetting) {
            return res.status(400).send({ message: 'Invalid Difficulty Setting' })
        }

        const newQuestion = new Quest({
            question,
            options,
            correctAnswer,
            topic: validTopic._id,
            difficulty: validSetting,
            hint
        })

        const savedQuestion = await newQuestion.save()
        validTopic.questions.push(savedQuestion._id)
        await validTopic.save()

        res.status(200).send({ message: 'Question has been added', savedQuestion })
    } catch (error) {
        res.status(500).send({ message: 'Error adding question', error })
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
        const { question, options, correctAnswer, topicId, difficulty, hint } = questionData

        try {
            const validTopic = await Topic.findById(topicId)
            if (!validTopic) {
                invalidQuestions.push({ question, message: 'Invalid Topic' })
                continue
            }

            const validSetting = setting(difficulty)
            if (!validSetting) {
                invalidQuestions.push({ question, message: 'Invalid Difficulty Setting' })
                continue
            }

            const newQuestion = new Quest({
                question,
                options,
                correctAnswer,
                topic: validTopic._id,
                difficulty: validSetting,
                hint
            })

            const savedQuestion = await newQuestion.save()
            validTopic.questions.push(savedQuestion._id)
            
            await validTopic.save()
            validQuestions.push(savedQuestion)
        } catch (error) {
            invalidQuestions.push({ question, message: 'Error saving question', error })
        }
    }

    if (invalidQuestions.length > 0) {
        return res.status(207).send({ message: 'Some questions could not be added', validQuestions, invalidQuestions })
    }
    console.log(validQuestions.length)
    res.status(200).send({ message: 'All questions have been added successfully', validQuestions })
})

router.post('/submit-answer', validateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const { questionId, selectedAnswer } = req.body
        const question = await Quest.findById(questionId)
        if (!question) {
            return res.status(404).send({ message: 'Question not found' })
        }

        const isCorrect = question.correctAnswer === selectedAnswer
        if (isCorrect) {
            user.LevelPoints += 1
            if (!user.answeredquestions.includes(questionId)) {
                user.answeredquestions.push(questionId)
            }
            await user.save()
        }

        res.status(200).send({
            success: isCorrect,
            message: isCorrect ? 'Correct answer!' : `Wrong answer. The correct answer is ${question.correctAnswer}`
        })
    } catch (error) {
        res.status(500).send({ message: 'Error submitting answer', error })
    }
})

router.get('/:topicId/:difficulty/:numOfQuestions', validateToken, async (req, res) => {
    const topicId = req.params.topicId
    const difficulty = req.params.difficulty
    const numOfQuestions = parseInt(req.params.numOfQuestions)

    try {
        const user = await User.findById(req.user._id)
        const topicQuestions = await Quest.find({ topic: topicId })

        if (!topicQuestions || topicQuestions.length === 0) {
            return res.status(404).send({ message: 'No questions for this topic' })
        }

        const filteredQuestions = topicQuestions.filter(q =>
            q.difficulty === difficulty && Array.isArray(user.answeredquestions) &&
            !user.answeredquestions.includes(q._id)
        )

        if (!filteredQuestions || filteredQuestions.length === 0) {
            return res.status(404).send({ message: 'No questions for this difficulty' })
        }

        const limitedQuestions = filteredQuestions.slice(0, Math.min(filteredQuestions.length, numOfQuestions))
        if (limitedQuestions.length === 0) {
            return res.status(404).send({ message: 'No questions available after slicing' })
        }

        let subject = await  Topic.findOne({ _id: topicId })
        if(!subject){
            return res.status(404).send({message:"Invalid subject cannot proceed"})
        }
        const topicName = subject.name

        
        const questionData = await Data.findOneAndUpdate(
            {topicName },
            { $inc: { accessCount: 1 } },
            { upsert: true, new: true }
        ).catch(err => {
            console.error('Error during findOneAndUpdate:', err);
            throw err;
        })
        console.log(`Access count for topic ${topicName}:`, questionData.accessCount)
      
        res.status(200).json(limitedQuestions)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

router.patch('/reset-account', validateToken, async (req, res) => {
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
router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const cats = await Category.findById(category).populate('topics');

        if (!cats || cats.topics.length === 0) {
            return res.status(404).send('No topics found in this category');
        }
        
        res.status(200).json(cats.topics);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving topics', error });
    }
});


router.post('/add-topic', async (req, res) => {
    const { name, categoryName } = req.body

    try {
        
        const category = await Category.findOne({ name: categoryName })
        if (!category) {
            return res.status(404).send({ message: 'Category not found' })
        }

        
        const newTopic = new Topic({ name, categoryId: category._id })
        const savedTopic = await newTopic.save()

       
        category.topics.push(savedTopic._id)
        await category.save()

        res.status(200).send({ message: 'Topic added successfully', savedTopic })
    } catch (error) {
        res.status(500).send({ message: 'Error adding topic', error })
    }
})

router.get('/',async(req,res)=>{

    try{
        const topics = Quest.find()
    res.status(200).send({Topics:topics})

    }catch(err){
        console.log('Check 1')
        res.status(500).send({Message:err})
    }
})




module.exports = router
