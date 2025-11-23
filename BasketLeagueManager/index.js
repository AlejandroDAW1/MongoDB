const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/basketleaguemanager')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log('Error conectando a MongoDB:', err));

const app = express();
app.use(express.json());

const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const matchesRouter = require('./routes/matches');
app.use('/', playersRouter);
app.use('/', teamsRouter);
app.use('/', matchesRouter);


app.listen(8080, () => {
  console.log("Servidor escuchando en http://localhost:8080");
});
