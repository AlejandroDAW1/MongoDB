const mongoose = require("mongoose")

const tournamentSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: 2100,
  },
  season: {
    type: String,
    required: true,
    enum: ["Spring", "Summer", "Autumn", "Winter"],
  },
  organizer: {
    type: String,
    minlength: 3,
    maxlength: 70,
  },
  teams: [
    {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
});

module.exports = mongoose.model("Tournament", tournamentSchema);
