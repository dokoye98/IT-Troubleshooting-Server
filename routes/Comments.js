const express = require('express')
const router = express()
const Comment = require('../model/Comments')
const Reply =  require('../model/Replies')
const val = require('../TokenGen')
const Topic = require('../validations/Topic')
const User = require('../model/User')

router.post('/:topic/add-comment',val,async(req,res)=>{
    try{
        const comment = req.body.comment
        const topic = req.params.topic
        const formattedTopics = Topic(topic.slice(1))
       

        const newComment = new Comment({
            comment: comment,
            userId: req.user._id,
            topic: formattedTopics
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

router.post('/:commentId/reply/:parentReplyId?',val,async(req,res)=>{
    try{
        const {reply} = req.body
        
        
        const {parentReplyId} = req.params
        const newReply = new Reply({
            commentId:req.params.commentId,
            parentReplyId: parentReplyId || null,
            userId:req.user._id,
            reply:reply
        })
        
        const savedReply = await newReply.save()
       
        res.status(200).send({ message: 'Reply added', savedReply })
    } catch (error) {
        res.status(500).send({ message: 'Error adding reply', error })
    }
})

router.get('/:topic/comment', async (req, res) => {
   
    try {
        const topic = req.params.topic
        let formattedTopics = Topic(topic)
        
        const comments = await Comment.find({topic})
        
        if (!comments || comments.length === 0) {
            return res.status(404).send({ message: 'No comments found for this topic' })
        }
        res.status(200).json(comments)
    } catch (error) {
        res.status(500).send({ message: 'Error fetching comments', error })
    }
})


router.get('/:commentId/replies',async(req,res)=>{
    try{
        const replies  = await Reply.find({ commentId: req.params.commentId })
        console.log("Check 1")
        if (!replies || replies.length === 0) {
            return res.status(404).send({ message: 'No replies found for this comment' })
        }
        //console.log(replies)
        const user = await User.find({userId:replies.userId})
        //console.log(user)
        for(let i = 0; i < user.length; i++){

        
        console.log(user[i].username)
        
        }
        res.status(200).json(replies)
    } catch (error) {
        res.status(500).send({ message: 'Error fetching replies', error })
    }
})
module.exports = router