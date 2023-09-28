// imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to the database!'))
    .catch((error) => console.error('Database connection error:', error));

const db = mongoose.connection;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'my secret key', // Use environment variable or a default value
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Set template engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('uploads')); // Serve files from 'uploads' directory
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from 'public' directory

// Route prefix
app.use('/', require('./routes/routes')); // Adjust the prefix as needed, e.g., '/users' if you have '/users/add' route

// Start the server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
