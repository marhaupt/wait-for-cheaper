const express = require('express');
require('dotenv').config();
const firebase = require('firebase');

const rp = require('request-promise');
const cheerio = require('cheerio');

const scrape = html => {
  const $ = cheerio.load(html);
  const result = $('div.first > .pr > p > strong > a').text();
  const price =
    result
      .split(' ')
      .filter(p => p !== 'Kč')
      .join('') * 1;

  return price;
};

const checkOne = async item => {
  const html = await rp(item.url);
  const price = await scrape(html);
  const updated = { ...item, price };
  return updated;
};

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
  const prices = list.map(thing => checkOne(thing));

  Promise.all(prices)
    .then(done => res.json(done))
    .catch(error => console.error(error));
});

app.listen(port, () =>
  console.log(`Listening @ port http://localhost:${port}`)
);
