module.exports = class Answer {
  constructor(gameType) {
    this.nameId = "";
    this.headshotIdHash = "";
    this.gameType = gameType;
    this.answerResult = {
      answered: false,
      correct: false
    };
  }
};
