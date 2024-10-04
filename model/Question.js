const mongoose = require('mongoose')

const questionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],  
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  scenarioId: {
    type: String,  
    required: true
  },
  difficulty:{
    type:String,
    required:true
  },
  hint:{
    type:String,
    required:true
  }
},{
  versionKey:false
})

module.exports = mongoose.model('Question', questionSchema)


