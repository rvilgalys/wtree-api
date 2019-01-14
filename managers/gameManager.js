const PeopleManager = require("./peopleManager");
const UserManager = require("./userManager");
const Answer = require("../factories/answerFactory");
const bcrypt = require("bcrypt");

// the Game Manager is a singleton responsible for handling the game parts of the app
// it takes data from the PeopleManager, strips out elements that the client shouldn't have, and sends them on
// it also hashes 'sensitive' data such as headshot IDs to make matching by similar id numbers more difficult
// it depends on both the UserManager and the PeopleManager

class GameManager {
  constructor() {
    if (!GameManager.instance) {
      GameManager.instance = this;
    }
  }

  async submitAnswer(userData, answer) {
    try {
      if (!userData) throw new Error("Answer was submitted without User Data");

      return PeopleManager.personAndHeadshotIdMatch(
        answer.nameId,
        answer.headshotIdHash
      )
        .then(result => {
          answer.answerResult.correct = result;
          return UserManager.addUserAnswer(userData._id, answer);
        })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      throw err;
    }
  }

  // sends 6 names and 1 headshot, the client must pick the correct name
  async namePickGame(mattMode = false) {
    const selectedPeople = await PeopleManager.getRandomPersons(6, mattMode);
    // hash the IDs so that they cannot be easily matched together
    const hashedPeopleResult = await this.onlyNames(selectedPeople);
    const index = Math.floor(Math.random() * selectedPeople.length);
    const headshotPerson = selectedPeople[index];
    return bcrypt
      .hash(headshotPerson.headshot._id.toString(), 12) // not using await here so we can make sure the hashed id is in the returned value
      .then(hashedHeadshotId => {
        console.log(hashedHeadshotId);
        return {
          headshot: {
            _id: hashedHeadshotId,
            mimeType: headshotPerson.headshot.mimeType,
            imageUrl: headshotPerson.headshot.imageUrl,
            height: headshotPerson.headshot.height,
            width: headshotPerson.headshot.width
          },
          names: [...hashedPeopleResult],
          answerTemplate: mattMode
            ? new Answer("namePickMattMode")
            : new Answer("namePick")
        };
      })
      .catch(err => {
        throw err;
      });
  }
  async onlyNames(selectedPeople) {
    const onlyNames = await selectedPeople.map(async person => {
      return {
        name: person.name,
        _id: person._id
      };
    });
    return await Promise.all(onlyNames); // resolve all our promises
  }

  // send six headshots and one name, the client must pick the correct headshot
  async facePickGame(mattMode = false) {
    const selectedPeople = await PeopleManager.getRandomPersons(6, mattMode);
    // hash the IDs so that they cannot be easily matched together
    const hashedPeopleResult = await this.hashHeadshots(selectedPeople);
    const index = Math.floor(Math.random() * selectedPeople.length);
    const namedPerson = selectedPeople[index];
    return {
      faces: [...hashedPeopleResult],
      personName: {
        _id: namedPerson._id,
        name: namedPerson.name,
        jobTitle: namedPerson.jobTitle
      },
      answerTemplate: mattMode
        ? new Answer("facePickMattMode")
        : new Answer("facePick")
    };
  }
  // goes through a list of selected people and hashes all headshot IDs & removes the names
  async hashHeadshots(selectedPeople) {
    const hashedPeople = await selectedPeople.map(async person => {
      const hashedHeadshotId = await bcrypt.hash(
        person.headshot._id.toString(),
        12
      );
      //const hashedNameId = await bcrypt.hash(person._id.toString(), 12);
      return {
        _id: hashedHeadshotId,
        mimeType: person.headshot.mimeType,
        imageUrl: person.headshot.imageUrl,
        height: person.headshot.height,
        width: person.headshot.width
      };
    });
    return await Promise.all(hashedPeople); // resolve all our promises
  }
}

const instance = new GameManager();
Object.freeze(instance);

module.exports = instance;
