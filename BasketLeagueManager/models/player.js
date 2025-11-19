import mongoose, { Schema } from "mongoose";

const playerSchema = new Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    match: /^[A-Z]{2}$/,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["Base", "Escolta", "Alero", "Ala-pívot", "Pívot", "Polivalente"],
  },
});

const Player = mongoose.model("Player", playerSchema);
export default Player;
