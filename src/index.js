const express = require('express');
require('dotenv').config();
const firebase = require('firebase');

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: 'wait-for-cheaper.firebaseapp.com',
  databaseURL: 'https://wait-for-cheaper.firebaseio.com',
  projectId: 'wait-for-cheaper',
  storageBucket: 'wait-for-cheaper.appspot.com',
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const stuff = database.ref('stuff');

let list = [];

stuff.once('value', snapshot => {
  list = snapshot.val();
});

const app = express();

const port = process.env.PORT || 3131;

app.get('/', (req, res) => {
  res.json(list);
});

app.listen(port, () =>
  console.log(`Listening @ port http://localhost:${port}`)
);
