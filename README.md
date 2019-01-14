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
  - This is all rather undercut by nearly everyone's name being somewhere in their headshot URL, but that at least made testing easier. If we were really paranoid, we could serve the images directly through the app.

## API Documentation

Most of the valid paths will also link to subpaths where relevant. Sending a GET request to the server will return some JSON with the root paths, and there should be links there to any other endpoints with useful data.

To fully implement a front-end the following steps would be necessary:

### Authentication

To play the game and submit answers, a user will need to be created and authenticated. This is done by sending a POST request to `/users/:username`. Optionally, the body of the request can include a simple JSON object with a `"password":` entry.

- If a user here does not yet exist, a new one will be created. If not password was provided, the current Date() will be used (unlikely they will be able to log in again). Passwords are hashed before being saved.
- If the user does exists, they must submit a valid password in the body of the request. If using Postman to check, remember to set your body type to `raw` and `JSON`.
- When validated, a the reply will include a `token` (JSON Web Token) good for 6 hours. Include this in the submitted headers with an `Authorization:` `Bearer <token>` key-value pair.
- A valid token is only required to submit answers. The server does not track which answers are sent to which users in order to stick to RESTful principles.

### Fetching Game Rounds

To play the game, a client will send a GET request to any of the four game endpoints:

- `/game/facepick`
- `/game/facepick/mattmode`
- `/game/namepick`
- `/game/namepick/mattmode`

These are all discoverable with a GET to `/game`. The game will return the given matching challenge with 6 options. Headshot IDs are hashed when sent to the client. To make things simple, a blank `answerTemplate` object is included in the response.

A client only needs to fill in the `answerTemplate` with a user-selected Headshot-ID and Name-ID.

This will then be sent back in the body of a POST request to `/game/answer` (the instructions are also included in the answer template).

The server does not currently track which `gameType` it has sent to who, so this could still be spoofed by determined cheaters.

## Installation & Instructions

To install locally, clone the repo to your own machine and in the terminal run `npm install` in it's directory. I would also suggest that in `packages.json` switch the `"start"` script back to `nodemon server.js`. The following enviornmental variables need to be set as well (can do easily in `nodemon.json`). Since this is a test deployment, nearly everything is given here (if you are at WillowTree looking to run this locally and need the credentials, please contact me):

- DOCUMENTATION: https://github.com/rvilgalys/wtree-api
- JWT_EXPIRATION: 6h
- JWT_KEY: bpwLgmZPQjVsk4cXrXH%NHFCEVRHfk
- MONGO_DB: wtree-namegame-api
- MONGO_PASSWORD: nice try....
- MONGO_USER: namegame_admin

## Tech Stack

For this project I used Node.js running Express, deployed to Heroku. This connects to a MongoDB Atlas cluster.
