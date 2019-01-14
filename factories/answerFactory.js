module.exports = class Answer {
  constructor(gameType) {
    this.nameId = "";
    this.headshotIdHash = "";
    this.gameType = gameType;
    this.answerResult = {
      answered: false,
      correct: false
    };
    this.clientInstructions =
      "Submit this template in the body of a POST request (with valid Auth headers) to /game/answer";
  }
};
