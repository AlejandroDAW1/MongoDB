const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/basketleaguermanager')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log('Error conectando a MongoDB:', err));

const app = express();
app.use(express.json());

const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const matchesRouter = require('./routes/matches');
app.use('/players', playersRouter);
app.use('/teams', teamsRouter);
app.use('/matches', matchesRouter);


app.listen(8080, () => {
  console.log("Servidor escuchando en http://localhost:8080");
});
