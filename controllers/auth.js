const User = require('../models/User');

function validateCredentials(username, password) {
  // Not Empty Checker
  if (!username || !password) {
    return "Username and password are required";
  }

  // Email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail.com$/;
  if (!emailRegex.test(username)) {
    return "Username must be a valid Gmail address";
  }

  // Email has to be longer than 6 characters (Google policy)
  if (username.length <= 6) {
    return "Email must be longer than 6 characters";
  }

  // Validate password criteria
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    return passwordErrors.join("\n"); // Join errors with new lines
  }

  // No criteria triggered
  return null;
}

// Function to validate password criteria
function validatePassword(password) {
  const errors = [];

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/(?=.*[!@#$%^&*()\-_=+\\\[\]{}|;:'",.<>?])/.test(password)) {
    errors.push("Password must contain at least one symbol");
  }
  if (password.length < 8 || password.length > 32) {
    errors.push("Password must be 8-32 characters long");
  }

  return errors;
}

// Function to sanitize username and password
function sanitizeCredentials(username, password) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  return { username: trimmedUsername, password: trimmedPassword };
}

exports.getRegister = (req, res) => {
  res.render('register', { title: 'Register' });
};

// Log in portion!
exports.postRegister = async (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  const validationErrors = validateCredentials(username, password);
  if (validationErrors) {
    return res.status(400).send(validationErrors);
  }

  try {
    // Sanitize credentials (trims)
    const { username: sanitizedUsername, password: sanitizedPassword } = sanitizeCredentials(username, password);

    // Check if user already exists
    const existingUser = await User.findOne({ username: sanitizedUsername });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    // Create new user
    const user = new User({ username: sanitizedUsername, password: sanitizedPassword });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Error during registration');
  }
};

exports.getLogin = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  if (!validateCredentials(username, password)) {
    try {
      // Sanitize credentials (trims)
      const { username: sanitizedUsername, password: sanitizedPassword } = sanitizeCredentials(username, password);

      // Checking preexisting email and password
      const user = await User.findOne({ username: sanitizedUsername });
      if (!user || user.password !== sanitizedPassword) {
        return res.status(400).send('Unknown username and password combination');
      }
      req.session.user = user;
      res.redirect('/');
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Error during login');
    }
  } else {
    // Validation failed
    res.status(400).send('Invalid username or password');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.cookie('__session', '')
  res.redirect('/login');
};
