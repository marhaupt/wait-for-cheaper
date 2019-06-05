const express = require('express');
require('dotenv').config();
const firebase = require('firebase');
const checkOne = require('./checkOne.js');

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
const stuffRef = database.ref('stuff');

let list = [];

stuffRef.once('value', snapshot => {
  list = snapshot.val();
});

const app = express();

const port = process.env.PORT || 3131;

app.get('/', (req, res) => {
  const prices = list.map(thing => checkOne(thing));

  Promise.all(prices)
    .then(done => {
      list = done;
      stuffRef.set({ ...done });
      res.json(done);
    })
    .catch(error => console.error(error));
});

app.listen(port, () =>
  console.log(`Listening @ port http://localhost:${port}`)
);
