const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({

    firstname:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    lastname:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    username:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    email:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:1056
    },
    answeredquestions:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Question',
        default: []
    }, LevelPoints: {
        type: Number,
        default: 0
    },
    correctQuizQuestions: {
        type: Number,
        default: 0
    },
},
{
    versionKey:false
}
)

module.exports = mongoose.model('Users',UserSchema)