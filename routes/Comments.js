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


router.post('/vote/:type/:commentId', val, async (req, res) => {
    try {
        const { type, commentId } = req.params; // Extract type (upvote/downvote) and commentId
        const userId = req.user._id;

        // Validate type
        if (!['upvote', 'downvote'].includes(type)) {
            return res.status(400).send({ message: 'Invalid vote type. Must be "upvote" or "downvote".' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // Voting logic
        if (type === 'upvote') {
            if (comment.likedBy.includes(userId)) {
                // Remove upvote
                comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId.toString());
                comment.upvotes -= 1;
            } else {
                // Add upvote
                comment.likedBy.push(userId);
                comment.upvotes += 1;

                // Remove downvote if exists
                if (comment.dislikedBy.includes(userId)) {
                    comment.dislikedBy = comment.dislikedBy.filter((id) => id.toString() !== userId.toString());
                    comment.downvotes -= 1;
                }
            }
        } else if (type === 'downvote') {
            if (comment.dislikedBy.includes(userId)) {
                // Remove downvote
                comment.dislikedBy = comment.dislikedBy.filter((id) => id.toString() !== userId.toString());
                comment.downvotes -= 1;
            } else {
                // Add downvote
                comment.dislikedBy.push(userId);
                comment.downvotes += 1;

                // Remove upvote if exists
                if (comment.likedBy.includes(userId)) {
                    comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId.toString());
                    comment.upvotes -= 1;
                }
            }
        }

        await comment.save();

        res.status(200).send({
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} toggled successfully.`,
            upvotes: comment.upvotes,
            downvotes: comment.downvotes,
        });
    } catch (error) {
        console.error(`Error toggling ${req.params.type}:`, error);
        res.status(500).send({ message: `Error toggling ${req.params.type}`, error });
    }
});




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