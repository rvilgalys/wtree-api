const UserManager = require("./userManager");

class StatManager {
  constructor() {
    if (!StatManager.instace) {
      StatManager.instace = this;
    }
    return StatManager.instace;
  }

  async getLeaderboard() {
    try {
      return UserManager.getUsersStats().then(users => {
        return users.sort((userA, userB) => {
          return userB.stats.percentCorrect - userA.stats.percentCorrect;
        });
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

const instance = new StatManager();
Object.freeze(instance);

module.exports = instance;
