const express = require('express');
const session = require('express-session');
const hbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const generateRoomIdentifier = require('./util/roomIdGenerator');
const Message = require('./models/Message');
const homeHandler = require('./controllers/home');
const roomHandler = require('./controllers/room');
const nicknameHandler = require('./controllers/nickname');
const authHandler = require('./controllers/auth');
const cookieParser = require("cookie-parser");

const app = express();
const port = 8080;

const mongoDBConnectionString = 'mongodb+srv://ldiep008:1234@cs110-lab7.tuqag7u.mongodb.net/?retryWrites=true&w=majority&appName=CS110-Lab7';
mongoose.connect(mongoDBConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Handlebars setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts/'),
  helpers: {
    isOwnMessage: function (messageUsername, username) {
      return messageUsername === username;
    }
  },
  allowProtoPropertiesByDefault: true
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user || req.cookies.__session) {
    return next();
  }
  res.redirect('/login');
}


// Routes
app.get('/register', authHandler.getRegister);
app.post('/register', authHandler.postRegister);
app.get('/login', authHandler.getLogin);
app.post('/login', authHandler.postLogin);
app.get('/logout', authHandler.logout);

app.get('/', isAuthenticated, homeHandler.getHome);
app.post('/new-room', isAuthenticated, async (req, res) => {
  const Room = require('./models/Room');
  const roomId = generateRoomIdentifier();

  const newRoom = new Room({ roomId });
  await newRoom.save();

  res.redirect(`/${roomId}`);
});

app.get('/nickname/:roomId', isAuthenticated, nicknameHandler.getNickname);
app.post('/nickname/:roomId', isAuthenticated, nicknameHandler.postNickname);
app.get('/:roomName', isAuthenticated, roomHandler.getRoom);
app.post('/:roomName/message', isAuthenticated, async (req, res) => {
  const { roomName } = req.params;
  const { text, username } = req.body;
  const Message = require('./models/Message');
  const newMessage = new Message({ roomId: roomName, nickname: username, text, createdAt: new Date() });
  await newMessage.save();
  res.redirect(`/${roomName}?nickname=${username}`);
});

app.get('/search/:roomId', isAuthenticated, async (req, res) => {
  const roomId = req.params.roomId;
  const searchTerm = req.query.q.trim();
  try {
    const query = {
      roomId: roomId,
      text: { $regex: searchTerm, $options: 'i' }
    };
    const messages = await Message.find(query).exec();
    res.json(messages);
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Edit message route
app.put('/message/:id', isAuthenticated, async (req, res) => {
  const messageId = req.params.id;
  const newText = req.body.text;
  try {
    const message = await Message.findById(messageId);
    const user = req.session.user;
    // Splice username
    const username = (user?.username || req.cookies.__session).split('@')[0];
    // Compare with spliced username
    if (message.nickname === username) { 
      message.text = newText;
      await message.save();
      res.json({ success: true });
    } else {
      res.status(403).json({ success: false, error: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Delete message route
app.delete('/message/:id', isAuthenticated, async (req, res) => {
  const messageId = req.params.id;
  try {
    const message = await Message.findById(messageId);
    const user = req.session.user;
    // Splice username
    const username = (user?.username || req.cookies.__session).split('@')[0];
    // Compare with spliced username
    if (message.nickname === username) {
      await message.remove();
      res.json({ success: true });
    } else {
      res.status(403).json({ success: false, error: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// Server listening
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
