const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  emoji: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: String,
    required: true,
    enum: ['Danny', 'Ashley', 'Olivia']
  },
  category: {
    type: String,
    required: true,
    enum: ['Today', 'Scheduled', 'Family Tasks', 'All', 'Flagged', 'Completed', 'Assigned', 'Work'],
    default: 'All'
  },
  originalCategory: {
    type: String,
    enum: ['Today', 'Scheduled', 'Family Tasks', 'All', 'Flagged', 'Assigned', 'Work'],
    default: 'All'
  },
  customList: {
    type: String,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
    default: null
  },
  dueTime: {
    type: String,
    default: ''
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
