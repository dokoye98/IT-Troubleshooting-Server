const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
      type:String,
      required:true
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    likedBy:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    dislikedBy:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{
    versionKey:false
})

module.exports = mongoose.model('Comment', commentSchema)
