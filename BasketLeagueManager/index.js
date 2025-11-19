const express = require('express');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/basketleaguermanager');

const players = require(__dirname + '/routes/players');
const matches = require(__dirname + '/routes/matches');
const teams = require(__dirname + '/routes/teams');

let app = express();
app.listen(8080);

app.use(express.json());
app.use('/mascotes', players);
app.use('/restaurants', matches);
app.use('/contactes', teams);