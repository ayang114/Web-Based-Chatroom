const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uniqueRoom = new Schema({
  roomId: { type: String, required: true }
});

const Room = mongoose.model('Room', uniqueRoom);
module.exports = Room;
