const express = require('express');
const app = express();
const open = require('open');
const fs = require('fs');
const googleapis = require('./modules/googleapi.js');
const PORT = 3000;
let secret;
// generate a url that asks permissions for youtube
const scopes = [
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

try {
  secret = JSON.parse(fs.readFileSync('clientSecret.json', 'utf8'));
} catch (e) {
  console.error('Reading clientSecret.json failed (not present?)');
}


const oauth2Client = googleapis.newOAuth2Client(
    secret.clientId,
    secret.clientSecret,
    "http://localhost:3000/oauth2callback"
);

const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  // If you only need one scope you can pass it as a string
  scope: scopes
});

console.log(`OAuth2 Url:\n${url}`);
open(url);

app.use(express.static(__dirname + '/content'));
app.set('view engine', 'pug');
app.set('views', './views');

app.get('/oauth2callback*', (req, res) => {
  console.log('Auth Callback');
  if (req.query) {
    oauth2Client.getToken(req.query.code).then((response) => {
      oauth2Client.setCredentials(response.tokens);
      console.log('Access Token:\n', response.tokens);
      res.redirect('/');
    });
  } else {
    res.send('Hallo');
  }
});

app.listen(PORT, () => {
  console.log(`Web Server Running: http://localhost:${PORT}`);
});

app.get('/raw', (req, res) => {
  console.log('/raw');
  if (req.query && req.query.videoId) {
    var parameter = {
      videoId: req.query.videoId,
    }
    if (req.query.searchTerms) parameter['searchTerms'] = req.query.searchTerms;
    googleapis.getComments(oauth2Client, parameter).then((data) => {
      console.log(`Quered ${data.pageInfo.totalResults} Comments`);
      res.render('comments', {
        data: data
      });
    }, e => {
      if (e) res.send('Error:\n' + e);
    });
  } else {
    res.send('No videoId query');
  }
});

app.get('/chain', (req, res) => {
  console.log('/chain');
  if (req.query && req.query.parentId) {
    var parameter = {
      parentId: req.query.parentId
    }
    googleapis.getCommentChain(oauth2Client, parameter).then((data) => {
      res.render('commentChain', {
        data: data
      })
    }, (e) => {
      if (e) res.send('Error:\n' + e);
    });
  } else {
    res.send('No videoId query');
  }
})
