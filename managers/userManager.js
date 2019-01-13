const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserManager {
  constructor() {
    if (!UserManager.instance) {
      this.usersCache = User.find()
        .then(users => users)
        .catch(err => console.log(err));
      UserManager.instance = this;
    }
    return UserManager.instance;
  }

  async getUsers() {
    return await User.find();
  }
  getUsersCache() {
    return this.usersCache;
  }

  async createNewUser(user) {
    let hashedPW;
    if (!user.password) {
      console.log("User being created with no password");
      // password is not required for one time logins, so we will just use the date instead
      const dateString = new Date().toISOString();
      hashedPW = await bcrypt.hash(dateString, 12);
    } else {
      hashedPW = await bcrypt.hash(user.password, 12);
    }

    const newUser = new User({
      userName: user.userName,
      password: hashedPW,
      joined: new Date()
    });
    return await newUser.save();
  }

  // creates a new
  async submitUser(user) {
    const testUser = await User.findOne({ userName: user.userName });
    if (!testUser) {
      // if no user exists, we will create a new one
      return await this.createNewUser(user);
    }

    const validPassword = await bcrypt.compare(
      user.password,
      testUser.password
    );

    const token = await jwt.sign(
      { userName: testUser.userName, _id: testUser._id },
      process.env.JWT_KEY,
      {
        expiresIn: "6h"
      }
    );

    if (!validPassword) {
      throw new Error(
        "This user exists and was either created without a password or the incorrect password is supplied."
      );
    }

    testUser.password = null; // set this to null before giving it back
    testUser.token = token;

    return testUser;
  }
}

const instance = new UserManager();
Object.freeze(UserManager);

module.exports = instance;
