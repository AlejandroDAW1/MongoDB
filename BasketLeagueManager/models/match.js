const mongoose = require("mongoose")

const playerStatsSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  points: Number,
  rebounds: Number,
  assists: Number,
  steals: Number,
  fouls: Number,
  mvp: {
    type: Boolean,
    default: false,
  },
});

const matchSchema = new mongoose.Schema({
  tournament: { 
    type: String, 
    required: true, 
    minlength: 3, 
    maxlength: 100 
  },
  date: {
    type: Date,
    required: true,
  },
  stage: {
    type: String,
    required: true,
    enum: ["Group", "Quarterfinal", "Semifinal", "Final"],
  },
  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    validate: {
      validator: function (value) {
        return value.toString() !== this.homeTeam.toString();
      },
      message: "awayTeam must be different from homeTeam",
    },
  },
  homeScore: {
    type: Number,
    required: true,
    min: 0,
  },
  awayScore: {
    type: Number,
    required: true,
    min: 0,
  },
  playerStats: [playerStatsSchema],
});

module.exports = mongoose.model("Match", matchSchema);
