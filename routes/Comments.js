const express = require('express')
const router = express()
const Comment = require('../model/Comments')
const val = require('../TokenGen')

router.post('/add-comment',val,async(req,res)=>{
    try{
        const {comment,topic} = req.body

        const newComment = new Comment({
            comment: comment,
            userId: req.user._id,
            topic: topic
        })
        const savedComment = await newComment.save()
        res.status(200).send({ message: 'Comment added', savedComment })
    }catch(error){
        res.status(500).send({ message: 'Error adding comment', error })
    }
})

router.post('/:commentId/downvote', val, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' })
        }

        
        if (comment.dislikedBy.includes(req.user._id)) {
            comment.dislikedBy.pull(req.user._id)
            comment.downvotes -= 1
        } else {
        
            comment.dislikedBy.push(req.user._id)
            comment.downvotes += 1

            if (comment.likedBy.includes(req.user._id)) {
                comment.likedBy.pull(req.user._id)
                comment.upvotes -= 1
            }
        }

        await comment.save()

        res.status(200).send({
            message: 'Downvote toggled successfully',
            upvotes: comment.upvotes,
            downvotes: comment.downvotes
        })
    } catch (error) {
        res.status(500).send({ message: 'Error toggling downvote', error })
    }
})

router.post('/:commentId/upvote', val, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' })
        }

        
        if (comment.likedBy.includes(req.user._id)) {
            comment.likedBy.pull(req.user._id)
            comment.upvotes -= 1
        } else {
        
            comment.likedBy.push(req.user._id)
            comment.upvotes += 1

            if (comment.dislikedBy.includes(req.user._id)) {
                comment.dislikedBy.pull(req.user._id)
                comment.downvotes -= 1
            }
        }

        await comment.save()

        res.status(200).send({
            message: 'Upvote toggled successfully',
            upvotes: comment.upvotes,
            downvotes: comment.downvotes
        })
    } catch (error) {
        res.status(500).send({ message: 'Error toggling upvote', error })
    }
})
module.exports = router