# Willowtree API Assignment

[Demo build running on Heroku](https://rocky-plateau-26626.herokuapp.com/)

## Goals and Project Scope

The goal of this project was to create a name and face matching game API for employees of WillowTree, where all of the logic was handled on the server side. I clarified that this should be a RESTful API and tried to follow those practices as close as possible.

It does not include a front-end client, but can be tested with [Postman](https://www.getpostman.com/). A Postman collection is included here in the repo.

This API goes beyond the 'minimum' requirements in a few ways:

- It allows for both a `facePick` and `namePick` mode, where a user must choose the correct headshot or person's name respectively.
- It allows for "Mat(t) Mode" where only people named Mat(t) are returned.
- It allows for validating individual users with a password and JWT token, or for one-time users without a password to play and still have thier progress recorded.
- Statistics are kept on each user for questions they've answered and what percentage are correct, and a leaderboard is also available.
- The 'People' database, since it is unlikely to change often, is both cached on the server and refreshed from the provided JSON each day at mignight with node-cron.
- Since developers are clearly the most competative people in the whole world, and would gladly hack our program to bits in order to increase their score and get on the leaderboard, there are some anti-cheating deterrants to at least stop the lazier hackers:
  - User's previous answers are saved and submitting the same answer again will not increase their stats.
  - The IDs of the headshots are hashed before sending to the client, so that they are not one digit away from the IDs of their parent `Person` entry.
  - This is all rather undercut by nearly everyone's name being somewhere in their headshot URL, but that at least made testing easier. If we were really paranoid, we could serve the images directly through the app or rehost them somewhere else with new URLs.

## API Documentation

Most of the valid paths will also link to subpaths where relevant. Sending a GET request to the server will return some JSON with the root paths, and there should be links there to any other endpoints with useful data.

To fully implement a front-end the following steps would be necessary:

### Authentication

To play the game and submit answers, a user will need to be created and authenticated. This is done by sending a POST request to `/users/:username`. Optionally, the body of the request can include a simple JSON object with a `"password":` entry.

- If a user here does not yet exist, a new one will be created. If not password was provided, the current Date() will be used (unlikely they will be able to log in again). Passwords are hashed before being saved.
- If the user does exists, they must submit a valid password in the body of the request. If using Postman to check, remember to set your body type to `raw` and `JSON`.
- When validated, a the reply will include a `token` (JSON Web Token) good for 6 hours. Include this in the submitted headers with an `Authorization:` `Bearer <token>` key-value pair.
- A valid token is only required to submit answers. The server does not track which answers are sent to which users in order to stick to RESTful principles.

### Fetching Game Rounds & Submitting Answers

To play the game, a client will send a GET request to any of the four game endpoints:

- `/game/facepick`
- `/game/facepick/mattmode`
- `/game/namepick`
- `/game/namepick/mattmode`

These are all discoverable with a GET to `/game`. The game will return the given matching challenge with 6 options. Headshot IDs are hashed when sent to the client. To make things simple, a blank `answerTemplate` object is included in the response.

A client only needs to fill in the `answerTemplate` with a user-selected Headshot-ID and Name-ID.

This will then be sent back in the body of a POST request to `/game/answer` (the instructions are also included in the answer template). In order to make a POST request, the user will need a valid Auth token in their header.

The server does not currently track which `gameType` it has sent to who, so this could still be spoofed by determined cheaters.

### Other Endpoints

Our API also provides some other endpoints:

- `/people` Used for testing, and no longer relevant. Left up for illustrative purposes. Returns unobfusticated random selection of six people.
- `/users` A list of users, with links to their individual user endpoints. Each user has a `/users/:username/stats` entry as well.
- `/stats` A leaderboard, sorted by percentage of correct answers. Currently being dominated by user `qwerty` with a staggering 1 of 1 answer correct.

## Installation & Instructions

To install locally, clone the repo to your own machine and in the terminal run `npm install` in it's directory. I would also suggest that in `packages.json` switch the `"start"` script back to `nodemon server.js`. The following enviornmental variables need to be set as well (can do easily in `nodemon.json`). Since this is a test deployment, nearly everything is given here (if you are at WillowTree looking to run this locally and need the credentials, please contact me):

- DOCUMENTATION: https://github.com/rvilgalys/wtree-api
- JWT_EXPIRATION: 6h
- JWT_KEY: bpwLgmZPQjVsk4cXrXH%NHFCEVRHfk
- MONGO_DB: wtree-namegame-api
- MONGO_PASSWORD: nice try....
- MONGO_USER: namegame_admin

## Tech Stack

For this project I used Node.js running Express, deployed to Heroku. This connects to a MongoDB Atlas cluster for data storage, with a Mongoose client to access it. The data stored on the cluster is in two collections, a simplified 'People' cluster from the provided JSON data and our 'Users'.

## App Internals

There are plenty of comments in the code, so here we'll just go over the main parts:

### Server.js and App.js

Here we are just spinning up a node server and setting up express. This also handles connecting to the database and provides a resting place for any errors or bad requests that come to the server.

### API

This has two main sections: `/routes` and `/middleware`. `/middleware` only has a simple script to check our JWT tokens. `/routes` handles all our endpoints for the different sections and where relevant adds the `checkToken` middleware. Routes are all wrapped in `try{} catch{}` blocks and errors are returned to the client in JSON responses.

### Factories

This has only an `answerFactory.js` class, which generates Answer objects for the `GameManager`.

### Models

These are two schemas for mongoose, one for `users` and one for `people`. In the case of this app, these are separate areas. Perhaps this naming is a bit too close.

### Managers

This is where the heavy lifting is done. I chose to use four Singleton classes with separate responsibilities. While my experience has shown Singletons can cause issues as a project scales in complexity, I used them here because they are a well-defined pattern, they are reasonably quick to implement for something like this, and the scope of this assignment was fairly limited. It also made a lot of sense to do all of our database work in two singletons for each area, so that we are not sending or saving queiries from all over the program.

#### UserManager

The UserManager is responsible for fetching, creating, and validating users. It should be the only part of the program that accesses the Users collection at the Database. It has some helper methods for adding answers and accessing users' stats.

The UserManager has no dependencies on other parts of the program.

#### PeopleManager

The PeopleManager is responsible for fetching, simplifying, maintaining a local cache of the people whose names and faces the user will be quizzed on. It has a node-cron task to update the cache and database once a day in case there are personell changes in the "authoritative" source. It also has a helper methods to provide a list of random people, matching headshot and name IDs, and for "matt mode".

The PeopleManager has no dependencies on other parts of the program.

#### GameManager

The GameManager is responsible for the game logic, serving the different types of Games, and nominally making it difficult to cheat. It generates the game rounds with the help of the PeopleManager, validates answers with the PeopleManager, and records those answers with the UserManager in each users profile.

The GameManager depends on the PeopleManager, the UserManager, and the AnswerFactory.

#### StatManager

The StatManager only serves up a leaderboard. It could be extended to do more with increased development time.

The StatManager depends on the UserManager.

## Closing Thoughts and Next Steps

Overall this was a fun project, and I was excited to work on it! With more time, a few ways this might be extended or improved could be:

- URLs of headshots could be further obfusticated before being served to the client, since nearly every headshot has someone's name or initals in it.
- Data could be cleaned more on import, there is a "WillowTree Staff" user that has no included headshot.
- We could keep track of which users were asked what questions (and when) to track response time, and to make sure that nefarious individuals don't just reload the page a thousand times looking for the people they actually know.
- Users who don't submit a password could be automatically cleaned out after a period of time.
- We could allow for users to change their username or password later on with a PATCH request.
- Leaderboards could be further sorted into weekly or other periods.
- Some users could be given admin privildges to modify entries like the People database.
- Other games or features could be sending a headshot and seeing how closely a user can type in their name (and if you can spell it right), sending a scrabled set of headshots and names to be matched together, matching job titles to people with names and faces, or a board of shame for whoever does the worst job of remembering company leadership 🙃.
