const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// very stripped down from the provided JSON data
// all we need to do for this guessing game is match names with faces
// and give the client enough information to correctly fetch the image from a URL
// we are also assuming we want to provide no extra data to the client at this point (social links)?

const personSchema = new Schema({
  name: {
    required: true,
    type: String
  },
  jobTitle: String,
  headshot: {
    _id: mongoose.Schema.Types.ObjectId,
    mimeType: String,
    imageUrl: String,
    height: Number,
    width: Number
  }
});

module.exports = mongoose.model("Person", personSchema);
