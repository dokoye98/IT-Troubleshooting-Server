const express = require('express');
const router = express.Router();
const Data = require('../model/QuestionData.js');


router.get('/analytics', async (req, res) => {
    try {
        const analytics = await Data.find();
        console.log('Analytics Data:', analytics); 
        console.log('This is check 1')
        res.status(200).json(analytics);
    } catch (error) {
        console.error('Error retrieving analytics data:', error);
        res.status(500).send({ message: 'Error retrieving analytics data', error });
    }
});




// Endpoint to get analytics for a specific topic
router.get('/analytics/:topicId', async (req, res) => {
    const topicId = req.params.topicId;

    try {
        const topicData = await Data.findOne({ topic: topicId })
        if (!topicData) {
            return res.status(404).send({ message: 'No analytics found for this topic' });
        }

        res.status(200).json(topicData);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving analytics for the topic', error });
    }
});

module.exports = router;
