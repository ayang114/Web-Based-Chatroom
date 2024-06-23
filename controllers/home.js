const Room = require('../models/Room');

async function getHome(req, res) {
  try {
    const rooms = await Room.find({});
    const username = req.session.user?.username || req.cookies.__session;
    res.render('home', { title: 'Home', chatRooms: rooms, username });
  } catch (error) {
    res.status(500).send('Error retrieving rooms: ' + error.message);
  }
}

module.exports = {
  getHome
};
