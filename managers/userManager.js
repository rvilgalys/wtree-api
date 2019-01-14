const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// UserManager is a singleton class for accessing all of the stored Users (currently on MongoDB Atlas)
// It should be used as the portal for everything in the Users collection
// It should not depend on any other singletons

class UserManager {
  constructor() {
    if (!UserManager.instance) {
      // setting up the cache we could choose to schedule a node cron method to refresh the cache
      // i doubt i'll be doing that here because we're not at that scale yet
      // and i don't want to somehow bump up to the paid tier of a free Mongo collection
      this.usersCache = User.find()
        .then(users => users)
        .catch(err => console.log(err));
      UserManager.instance = this;
    }
    return UserManager.instance;
  }

  // --- access methods for other parts of our app ---
  async getUsers() {
    try {
      return User.find()
        .then(users => {
          return users.map(user => {
            return {
              _id: user._id,
              userName: user.userName,
              joined: user.joined
            };
          });
        })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      console.log(err);
      return {
        error: err
      };
    }
  }

  async getUsersStats() {
    try {
      return User.find()
        .then(users => {
          return users.map(user => {
            return {
              _id: user._id,
              userName: user.userName,
              stats: user.userStats
            };
          });
        })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      return {
        error: err
      };
    }
  }

  async getUserByUsername(userName) {
    try {
      return User.findOne({ userName: userName }).then(user => {
        console.log(user);
        return {
          _id: user._id,
          userName: user.userName,
          joined: user.joined
        };
      });
    } catch (err) {
      console.log(err);
      return {
        error: err
      };
    }
  }

  async getUserStatsByUsername(userName) {
    try {
      return await User.findOne({ userName: userName }).then(user => {
        return {
          _id: user._id,
          userName: user.userName,
          stats: {
            percentCorrect: user.userStats.percentCorrect,
            questionsAnswered: user.userStats.questionsAnswered
          }
        };
      });
    } catch (err) {
      console.log(err);
      return {
        error: err
      };
    }
  }

  getUsersCache() {
    return this.usersCache;
  }
  async refreshCache() {
    this.usersCache = await User.find();
  }

  // should be called internally by the submitUser method
  async createNewUser(user) {
    try {
      let hashedPW;
      if (!user.password) {
        console.log("User being created with no password");
        // password is not required for one time logins, so we will just use the date instead
        const dateString = new Date().toISOString();
        hashedPW = await bcrypt.hash(dateString, 12);
      } else {
        hashedPW = await bcrypt.hash(user.password, 12);
      }
      const token = jwt.sign(
        // if a user is logging in or new, we provide a new token in return
        { userName: user.userName, _id: user._id },
        process.env.JWT_KEY,
        {
          expiresIn: process.env.JWT_EXPIRATION.toString()
        }
      );
      console.log(token);
      const newUser = new User({
        userName: user.userName,
        password: hashedPW,
        joined: new Date()
      });
      await newUser.save();
      newUser.token = token;
      return newUser;
    } catch (err) {
      throw err;
    }
  }

  // expects an object with { userName, password }
  // either creates a new user if none exists with the given username, or attempts to validate a user's password if it does
  // allows for new users with no password
  // for new users or valid users, returns a fresh JSON token to access the rest of the game
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
    if (!validPassword) {
      throw new Error(
        "This user exists and was either created without a password or the incorrect password is supplied."
      );
    }

    const token = jwt.sign(
      // if a user is logging in or new, we provide a new token in return
      { userName: testUser.userName, _id: testUser._id },
      process.env.JWT_KEY,
      {
        expiresIn: process.env.JWT_EXPIRATION.toString()
      }
    );

    testUser.password = null; // set this to null before giving it back
    testUser.token = token;
    return testUser;
  }

  async addUserAnswer(userId, answer) {
    const newAnswer = {
      // map over only the data we actually need to a new object
      gameType: answer.gameType,
      faceId: answer.headshotId,
      nameId: answer.nameId,
      correct: answer.answerResult.correct
    };

    return await User.findById(userId)
      .then(user => {
        // first we escape if the User has already answered a question about this person (they still get a response back, but does not count for their stats)
        if (
          user.userStats.prevAnswers
            .map(prev => prev.nameId)
            .includes(newAnswer.nameId)
        )
          throw new Error("PrevAnswerMatched");

        return user;
      })
      .then(user => {
        // add our answer to the previous answers for that user
        user.userStats.prevAnswers.push(newAnswer);
        return user;
      })
      .then(user => {
        // do the stat keeping -- questions answered & % correct
        if (!user.userStats.questionsAnswered)
          user.userStats.questionsAnswered = 0;
        user.userStats.questionsAnswered += 1;
        const correctQuestions = user.userStats.prevAnswers.reduce(
          // maybe we should just track this number in the DB instead of computing it each time
          (sum, answer) => {
            if (answer.correct) return sum + 1;
            return sum;
          },
          0
        );
        user.userStats.percentCorrect = Math.floor(
          (correctQuestions / user.userStats.questionsAnswered) * 100
        );
        return user;
      })
      .then(user => user.save())
      .catch(err => {
        if (!err.message === "PrevAnswerMatched") throw err;
      });
  }
}

const instance = new UserManager();
Object.freeze(UserManager);

module.exports = instance;
