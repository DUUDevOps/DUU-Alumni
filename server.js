// set up ========================
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

// configuration =================
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

// main route
app.get('/alums', (req, res) => {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), findAllAlums, res);
  });
});

// catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// listen on port
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content, res) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), findAllAlums, res);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, res) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback, res);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, res);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback, res) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, res);
    });
  });
}

/**
 * Find all alumni via a call to Google Sheets API. Send response
 * to client via callback when done.
 * @param {Object} auth
 * @param {Object} res
 */
 function findAllAlums(auth, res) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1alP9t4yeCx537NEISGLjpijIeUmisUqAh-LcPQCSUyA',
    range: 'Alumni Info!B2:K245',
}, (err, res2) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res2.data.values;
    if (rows.length) {
      //console.log(res);
      //console.log(res2)
      var padded = padRows(rows);
      //console.log(padded);
      res.status(200).send(padded);
    } else {
      console.log('No data found.');
    }
  });
}

function padRows(rows){
  var ret = [];
  rows.forEach((row) => {
    var tmp = [];
    row.forEach((info) => {
      tmp.push(info);
    });
    for(var i = 0; i < 10 - row.length; i++){
      tmp.push('');
    }
    ret.push(tmp);
  });
  return ret;
}
