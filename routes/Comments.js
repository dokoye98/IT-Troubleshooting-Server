const express = require('express')
const router = express()
const Comment = require('../model/Comments')
const Reply =  require('../model/Replies')
const val = require('../TokenGen')
const Topic = require('../validations/Topic')
const User = require('../model/User')

router.post('/add-comment',val,async(req,res)=>{
    try{

        const comment = req.body.comment
      
       // const formattedTopics = Topic(topic)
       
        console.log('check 2')
        const newComment = new Comment({
            comment: comment,
            userId: req.user._id,
           // topic: formattedTopics
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
        console.log('downvote')
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
        console.log('upvote')
        res.status(200).send({
            message: 'Upvote toggled successfully',
            upvotes: comment.upvotes,
            downvotes: comment.downvotes
        })
    } catch (error) {
        res.status(500).send({ message: 'Error toggling upvote', error })
    }
})



router.get('/comment', async (req, res) => {
   //console.log('check 1')
    try {
        //const topic = req.params.topic
        //let formattedTopics = Topic(topic)
       // console.log(topic)
        
        const comments = await Comment.find()
        
        if (!comments || comments.length === 0) {
            return res.status(404).send({ message: 'No comments found' })
        }
        res.status(200).json(comments)
    } catch (error) {
        res.status(500).send({ message: 'Error fetching comments', error })
    }
})


router.post('/:commentId/reply/:parentReplyId?', val, async (req, res) => {
    try {
        const { reply } = req.body;
        const { commentId, parentReplyId } = req.params;

        const newReply = new Reply({
            commentId,
            parentReplyId: parentReplyId || null,
            userId: req.user._id,
            reply
        });

        const savedReply = await newReply.save();

        res.status(200).send({ message: 'Reply added', savedReply });
    } catch (error) {
        res.status(500).send({ message: 'Error adding reply', error });
    }
});

router.get('/:commentId/replies', async (req, res) => {
    try {
        const replies = await Reply.find({ commentId: req.params.commentId });

        if (!replies) {
            return res.status(200).json([]);
        }

        res.status(200).json(replies);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching replies', error });
    }
});


router.get('/:commentId', async (req, res) => {
    try {
        console.log('check 1 commentID ')
        const { commentId } = req.params;
        //console.log(commentId)
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }
       
        console.log(comment)
        res.status(200).send(comment);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching comment', error });
    }
});

module.exports = router