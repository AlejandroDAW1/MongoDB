const mongoose = require("mongoose")

const rosterSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  joinDate: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 50,
  },
  foundedAt: {
    type: Date,
  },
  roster: [rosterSchema],
});

module.exports = mongoose.model("Team", teamSchema);
