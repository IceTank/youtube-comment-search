##YouTube comment crawler
Searches for strings in Youtube video comments.

####Setup
Create a youtube app at http://console.developers.google.com and give it access to the Youtube v3 api.

Then copy the clientId and clientSecret into the clientSecret.json file.

####Usage note
The search is similar to the youtube search. If you but in foo bar it returns result for foo and bar but not necessarily results that included both foo and bar.

####Usage 
- Navigate into the directory. 
- Start the app with ```node main.js```. A browser window should automatically open. If not click on the link in the terminal window.
- Log into a google account.
- Past the video id of the video you want to search for comments into the field videoId. Past the search string you want to search for into the search box.
- Results should appear after it is done with its api calls.