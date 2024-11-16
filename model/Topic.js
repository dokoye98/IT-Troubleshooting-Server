const mongoose = require('mongoose');

const topicSchema = mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }]
  }, {
    versionKey: false
  });
  
  module.exports = mongoose.model('Topic', topicSchema);
  