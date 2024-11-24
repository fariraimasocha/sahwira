import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  title: {
    type: String,
    required: true
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

const ConversationModel = mongoose.models.Conversation;
const Conversation = ConversationModel ? ConversationModel : mongoose.model('Conversation', conversationSchema);

export { Conversation as default };