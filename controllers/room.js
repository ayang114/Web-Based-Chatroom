const Message = require('../models/Message');

async function getRoom(request, response) {
    const roomName = request.params.roomName;
    const user = request.session.user || request.cookies.__session;
    if (!user) {
        return response.redirect('/login');
    }

    Message.find({ roomId: roomName }, (err, messages) => {
        if (err) {
            return response.status(404).send('Error retrieving messages');
        }

        // Extract username from email address to split it w/ @gmail.com
        const username = (user?.username || request.cookies.__session).split('@')[0];

        const messagesPlain = messages.map(message => ({
            _id: message._id,
            username: message.nickname,
            text: message.text,
            createdAt: message.createdAt
        }));

        response.render('room', { 
            title: 'Chatroom', 
            roomName: roomName,
            // This is spliced username 
            username: username,
            messages: messagesPlain 
        });
    });
}

module.exports = {
    getRoom
};
