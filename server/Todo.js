const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    owner: {
      type: String,
      required: true,
      index: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Todo', todoSchema)
