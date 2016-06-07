# Transcode


## Before you begin...

Make sure you have the following installed (latest versions):

 * MongoDB
 * NodeJS
 * npm
 * Gulp
 * Bower


## Setup

### Database :
1. Create the directories /data/db and allow write on them for all users
2. Start the mongod process `mongod`
3. Connect to mongo with the client and create the DB :
```bash
mongo
> use <db_name>
```
Once the database is created, make the sure its name matches de DB env variable in the **server/.env** file.

### Server :

From the **server directory**, download the projet's dependencies : `npm install`.
Then run the script `node setup.js`to populate the database.

### Client :

From the **client folder**, download the node dependencies with `npm install` for gulp and the bower dependencies with `bower install`

## Configuration

Server configuration is located in the **server/.env file**. 
You must specify at least these variables :
 * PORT: the server listening port.
 * SECRET: the json web token signature’s secret key.
 * TOKEN_EXPIRES: the token expiration time.
 * DB: the database URL (in the form mongodb://<hostname>:<port>/<db_name>). Note that if you omit the port, Mongo will use the default one: 27017.
 * VIDEO_UPLOADS_DIR is where the app will store user uploads and task results.

For the social authentification to work, you need a [Facebook](https://developers.facebook.com) or [Google](https://developers.google.com) developper account and set the following variables:
* FB_CLIENT_ID
* FB_CLIENT_SECRET
* GOOGLE_CLIENT_ID
* GOOGLE_CLIENT_SECRET

The front web-client is much quicker, all you need to do is specify the URL of the API within the **client/src/app/config.js** file. Example:
```javascript
angular.module('Transcode')
  .constant('TcConfig', {
    API: 'http://localhost:3000/'
  });
```


## Run

Start the MongoDB daemon:
```bash
mongod
```

Start the API server (you need to execute the command from the **server** directory):
```bash
cd server/
node app.js
```

Start the front-end web-client:
```bash
cd client/
gulp
```

Test the API server by calling `http://localhost:3000/` (by default) in the browser, it should return **"API online"**.

Test the client by calling `http://localhost:8002/` (by default) in the browser.
