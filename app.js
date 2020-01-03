const express = require('express');
const app = express();
const mongoose = require('mongoose');

//Connecting to the DB
mongoose.connect('mongodb://localhost/messenger', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log('Connection has been made');
}).on('error', (err) => console.log(`error:\n${err}`));

//Importing routes
const register = require('./routes/register');
const login = require('./routes/login');

//Middlewares
app.use(express.json());

//Route Middlewares
app.use('/api/user/register', register);
app.use('/api/user/login', login);

const PORT = process.env.PORT || 1234
app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));