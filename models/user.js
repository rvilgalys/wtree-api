const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  gameType: String,
  faceId: String,
  nameId: String,
  correct: Boolean
});

const userSchema = new Schema({
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  joined: {
    type: Date,
    required: true
  },
  userStats: {
    percentCorrect: {
      type: Number,
      min: 0,
      max: 100
    },
    questionsAnswered: Number,
    prevAnwers: [answerSchema] // stored to make sure a user cannot ping the server over and over with a correct answer
  }
});

module.exports = mongoose.model("User", userSchema);
