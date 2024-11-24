import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  task: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


taskSchema.index({ userId: 1, status: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;