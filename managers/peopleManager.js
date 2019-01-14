const axios = require("axios");
const mongoose = require("mongoose");
const Person = require("../models/person");
const cron = require("node-cron");
const bcrypt = require("bcrypt");

const sourceUrl = "http://www.willowtreeapps.com/api/v1.0/profiles";

// PeopleManager is a singleton class responsible for populating, refreshing, and accessing our People collection of names and faces
// It simplfies the data provided, and generates new IDs for users and headshots (assuming clever devs might use the original data to increase their score if those were provided)
// Since WillowTree is hiring it runs a node-cron to refresh from the JSON data every day at midnight
// It also keeps a local cache of all the People for faster access
// Because generated ObjectIDs() are very close to one another, we should hash them before sending to the client to further obfusticate and prevent cheating

class PeopleManager {
  constructor() {
    // singleton pattern
    if (!PeopleManager.instance) {
      PeopleManager.instance = this;
      this.peopleCache = [];

      cron.schedule("0 0 0 * * *", async () => {
        // should run every day at midnight (assuming turnover isn't that frequent haha)
        await this.refreshPeopleDB();
        await this.refreshPeopleCache();
      });
    }
    return PeopleManager.instance;
  }

  async refreshPeopleDB() {
    try {
      console.log("Starting refresh of people DB from WillowTree API");
      await Person.deleteMany({}); // clear our existing DB
      const response = await axios.get(sourceUrl); // fetch from the given JSON
      const data = Array.from(response.data); // using Array.from() keeps our child objects intact, `new Array()` doesn't
      data.map(async entry => {
        // map over only necessary data to the new DB entry
        // NOTE: we are intentially leaving behind the original ID so that no untrustworthy client could use it
        const newPerson = new Person({
          name: `${entry.firstName} ${entry.lastName}`,
          jobTitle: entry.jobTitle || "",
          headshot: {
            _id: new mongoose.Types.ObjectId(),
            mimeType: entry.headshot.mimeType,
            imageUrl: entry.headshot.url,
            height: entry.headshot.height,
            width: entry.headshot.width
          }
        });
        await newPerson.save(); // if we run into problems later here, will have to make sure all of these promises are solved
      });
      console.log(`People database refreshed and saved at ${new Date()}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async refreshPeopleCache() {
    this.peopleCache.length = 0; // reset our cached people
    const peopleFromDB = await Person.find();
    return await this.peopleCache.push(...Array.from(peopleFromDB)); // spread our object into an array
  }

  async getPersonById(id) {
    try {
      if (this.peopleCache.length < 1) await this.refreshPeopleCache();
      return await this.peopleCache.find(
        person => person._id.toString() === id.toString()
      );
    } catch (err) {
      console.log("getpersonbyid");
      console.log(err);
      throw err;
    }
  }

  async getPersonByHeadshotId(id) {
    if (this.peopleCache.length < 1) await this.refreshPeopleCache();

    return this.peopleCache
      .find(person => person.headshot.id === id)
      .then(person => person)
      .catch(err => {
        console.log("getpersonbyheadshotid");
        console.log(err);
        throw err;
      });
  }

  async personAndHeadshotIdMatch(personId, headshotIdHash) {
    if (this.peopleCache.length < 1) await this.refreshPeopleCache();

    return this.getPersonById(personId)
      .then(async person => {
        if (!person) throw new Error("No Valid Person Found");
        return await bcrypt.compare(
          person.headshot._id.toString(),
          headshotIdHash
        );
      })
      .catch(err => {
        console.log("personAndHeadshotIDMatch " + err);
        throw err;
      });
  }

  // returns an array of Person[number]
  // args: number of people to return, exclusions[] of ids already matched
  async getRandomPersons(number = 6, mattMode = false) {
    if (this.peopleCache.length < 1) await this.refreshPeopleCache();

    const peopleArray = await this.doMattMode(mattMode);

    const personCount = peopleArray.length;

    if (personCount <= number)
      throw new Error(
        "PeopleManager: There are fewer (or equal) number of people in the cache than what was requested! Either hire more people or request a lower amount."
      );
    let result = [];
    while (result.length < number) {
      // generate random numbers, and push people into our array until we have enough
      // this could get really inefficient if we were always getting close to the number of total people in the DB
      const index = Math.floor(Math.random() * personCount);

      const someone = peopleArray[index];
      if (!result.includes(someone)) {
        result.push(someone);
      }
    }
    return result;
  }

  async doMattMode(mattMode) {
    const peopleArray = [];
    if (mattMode) {
      peopleArray.push(
        ...(await this.peopleCache.filter(person => {
          if (
            person.name.includes("Matt ") ||
            person.name.includes("Matthew ") ||
            person.name.includes("Mat ")
          ) {
            return true;
          }
        }))
      );
    } else {
      await peopleArray.push(...this.peopleCache);
    }
    await Promise.all(peopleArray);
    return peopleArray;
  }
}

const instance = new PeopleManager();
Object.freeze(instance);

module.exports = instance;
