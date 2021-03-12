const { google } = require('googleapis');
const playlists = google.youtube('v3').playlists;
const playlistItems = google.youtube('v3').playlistItems;
const channels = google.youtube('v3').channels;
const commentThread = google.youtube('v3').commentThreads;
const comments = google.youtube('v3').comments;

exports.newOAuth2Client = function(clientId, clientSecret, redirectUrl) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
}

exports.getCommentChain = function(oauth2, parameter) {
  return new Promise((resolve, reject) => {
    function foo(pageToken) {
      return new Promise((resolve2, reject2) => {
        const options = {
          auth: oauth2,
          part: [
            "snippet"
          ],
          parentId: parameter.parentId,
          textFormat: "html",
          maxResults: (parameter.maxResults || 50)
        }
        if (pageToken) options['pageToken'] = pageToken;
        comments.list(options).then(data => {
          resolve2(data);
        }, e => {
          if (e) reject2(e);
        });
      });
    }
    foo().then(async function(response) {
      const data = response.data;
      let totalResults = data.pageInfo.totalResults;
      let totalItems = data.items;
      if (data.nextPageToken) {
        let nextToken = data.nextPageToken;
        while (nextToken) {
          const response = await foo(nextToken);
          const data = response.data;
          totalItems = totalItems.concat(data.items);
          totalResults += data.pageInfo.totalResults;
          if (data.nextPageToken) {
            nextToken = data.nextPageToken;
            console.log('Next Token:', nextToken);
          } else {
            nextToken = null;
          }
        }
      }
      resolve({
        pageInfo: {
          totalResults: totalResults
        },
        items: totalItems
      })
    });
  })
}

exports.getComments = function(oauth2, parameter) {
  return new Promise((resolve) => {
    function foo(pageToken) {
      return new Promise((resolve2, reject2) => {
        const options = {
          auth: oauth2,
          part: [
            "snippet,replies"
          ],
          textFormat: "html",
          videoId: parameter.videoId,
          maxResults: (parameter.maxResults || 50)
        }
        if (parameter.searchTerms) options['searchTerms'] = parameter.searchTerms;
        if (pageToken) options['pageToken'] = pageToken;
        commentThread.list(options).then(data => {
          resolve2(data);
        }, (e) => {
          if (e) reject2(e);
        });
      });
    }
    foo().then(async function(response) {
      const data = response.data;
      let totalResults = data.pageInfo.totalResults;
      let totalItems = data.items;
      if (data.nextPageToken) {
        let nextToken = data.nextPageToken;
        while (nextToken) {
          const response = await foo(nextToken);
          const data = response.data;
          totalItems = totalItems.concat(data.items);
          totalResults += data.pageInfo.totalResults;
          if (data.nextPageToken) {
            nextToken = data.nextPageToken;
            console.log('Next Token:', nextToken);
          } else {
            nextToken = null;
          }
        }
      }
      resolve({
        pageInfo: {
          totalResults: totalResults
        },
        items: totalItems
      })
    });
  })
}


exports.getChannelInfo = function(oauth2) {
  return new Promise((resolve, reject) => {
    channels.list({
      part: [
        "snippet,contentDetails,statistics"
      ],
      mine: true,
      auth: oauth2
    }).then(data => {
      resolve(data);
    }, (e) => {
      if (e) reject(e);
    });
  });
}

exports.getPlaylistItems = function(oauth2, playlistId) {
  return new Promise((resolve, reject) => {
    function get(oauth2, playlistId, nextPageToken) {
      return new Promise((resolve2, reject2) => {
        const options = {
          part: [
            "snippet,contentDetails"
          ],
          playlistId: playlistId,
          maxResults: 25,
          auth: oauth2
        }
        if (nextPageToken) options["pageToken"] = nextPageToken;
        playlistItems.list(options).then((data) => {
          resolve2(data);
        }, (e) => {
          if (e) {
            reject2(e);
          }
        });
      });
    }

    (async (oauth2, playlistId) => {
      const playlistItems = [];
      let data;
      let pageToken = null;
      do {
        try {
          data = await get(oauth2, playlistId, pageToken);
          playlistItems.push(...data.data.items);
          if (data.data.nextPageToken) {
            console.log('pageToken', data.data.nextPageToken);
            pageToken = data.data.nextPageToken;
          } else {
            // console.log('No pageToken', data.data);
            pageToken = null;
          }
        } catch (e) {
          reject(e);
        }
      } while (pageToken);
      console.log(`Found ${playlistItems.length} Videos`);
      resolve(playlistItems);
    })(oauth2, playlistId);
  })
}

exports.getPlaylistInfo = function(oauth2) {
  return new Promise((resolve, reject) => {
    playlists.list({
      part: "snippet",
      mine: true,
      auth: oauth2
    }).then((data) => {
      // console.log('Status Code:', data.status);
      // console.log(data.data);
      resolve(data);
    }, (e) => {
      if (e) {
        console.log(e);
        reject(e);
      }
    })
  })
}
