const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Notification', NotificationSchema);
