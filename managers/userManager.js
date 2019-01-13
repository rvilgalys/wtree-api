class UserManager {
  constructor() {
    if (!UserManager.instance) {
      this.users = []; // fetch from DB later
      UserManager.instance = this;
    }
    return UserManager.instance;
  }
}

const instance = new UserManager();
Object.freeze(UserManager);

module.exports = instance;
