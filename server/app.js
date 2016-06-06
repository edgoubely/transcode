var express = require('express'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  morgan = require('morgan'),
  jwt = require('jsonwebtoken'),
  dotenv = require('dotenv'),
  validator = require('express-validator'),
  errorHandler = require('errorhandler'),
  auth = require('./security/auth.js'),
  facebook = require('./security/oauth2-facebook'),
  google = require('./security/oauth2-google'),
  http = require('http'),
  sio = require('socket.io');

/**
 *	Configuration
 */
dotenv.load({
  path: '.env'
});

var app = express();
var server = http.Server(app);
var io = {
  server: sio(server),
  clients: []
};

app.set('port', process.env.PORT ||  3000);
app.set('secret', process.env.SECRET);
app.set('core-url', process.env.CORE_URL);
app.set('token_expires', process.env.TOKEN_EXPIRES ||  '30m');
app.set('fb-client-id', process.env.FB_CLIENT_ID);
app.set('fb-client-secret', process.env.FB_CLIENT_SECRET);
app.set('google-client-id', process.env.GOOGLE_CLIENT_ID);
app.set('google-client-secret', process.env.GOOGLE_CLIENT_SECRET);
app.set('videos-base-directory', process.env.VIDEO_UPLOADS_DIR || 'videos');

/**
 *	Controllers
 */
var users = require('./controllers/users'),
  tasks = require('./controllers/tasks'),
  accounts = require('./controllers/accounts'),
  contact = require('./controllers/contact');


/**
 *	Database
 */
mongoose.connect(process.env.DB);
mongoose.connection.on('error', function(err) {
  console.log("Connection to MongoDB failed : " + err.message);
  process.exit(1);
});

/**
 *	Middlewares
 */
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(validator());
app.use(errorHandler());

/**
 *	Routes
 */
app.get('/', function(req, res) {
  res.end('API online');
});

app.post('/auth/login', users.signin);
app.post('/auth/signup', users.signup);
app.post('/auth/google', google.loginWithGoogle);
app.post('/auth/facebook', facebook.loginWithFacebook);
app.post('/auth/unlink', auth.isAuthenticated, accounts.unlink);

app.route('/user/account')
  .get(auth.isAuthenticated, accounts.getAccount)
  .post(auth.isAuthenticated, accounts.updateAccount)
  .delete(auth.isAuthenticated, accounts.deleteAccount);

app.post('/contact', contact.postContact);

app.get('/task', auth.isAuthenticated, tasks.index);
app.put('/task', tasks.submitTask);
app.post('/task/file', auth.isAuthenticatedOrGuest, tasks.fromFile);
app.post('/task/url', auth.isAuthenticatedOrGuest, tasks.fromURL);

/**
 *	Startup
 */
server.listen(app.get('port'), function() {
  console.log("Server started. Listening on port %d...", app.get('port'));
}).on('error', function(err) {
  console.log('Server startup error : ' + (err.code === 'EADDRINUSE' ? 'port ' + app.get('port') + ' already in use.' : err.message));
  process.exit(1);
});

/**
 * Socket.IO
 */

io.server.on('connection', function(socket) {
  socket.auth = false;

  socket.on('authenticate', function(token) {
    if (!token) return;

    jwt.verify(token, app.get('secret'), function(err, user) {
      if (err) return;
      io.clients[socket.id] = user._id;
      socket.emit('authenticated', true);
      socket.auth = true;
    });
  });

  setTimeout(function() {
    if (!socket.auth) {
      socket.disconnect('unauthorized');
    }
  }, 1000);
});

module.exports = app;