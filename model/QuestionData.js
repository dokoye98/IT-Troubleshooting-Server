const mongoose = require('mongoose');

const questionDataSchema = mongoose.Schema({
    topicName: {
        type: String,
        required: true
      },
    accessCount: {
        type: Number,
        default: 0
    }
}, { versionKey: false });

module.exports = mongoose.model('Data', questionDataSchema);
