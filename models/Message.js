const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unqiueMessage = new Schema({
  roomId: { type: String, required: true },
  nickname: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', unqiueMessage);
module.exports = Message;
