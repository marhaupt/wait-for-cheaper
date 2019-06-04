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

const simplifyPrices = prices => {
  const keys = Object.keys(prices);
  const values = Object.values(prices);
  const length = keys.length;

  if (
    length > 2 &&
    values[length - 1] === values[length - 2] &&
    values[length - 1] === values[length - 3]
  ) {
    const cutPrices = { ...prices };
    const deleteKey = keys[length - 2];
    delete cutPrices[deleteKey];
    return cutPrices;
  }

  return prices;
};

const checkOne = async ({ name, url, prices }) => {
  const html = await rp(url);
  const price = await scrape(html);
  const time = new Date().getTime();
  const updatedPrices = simplifyPrices({ ...prices, [time]: price });

  return { name, url, prices: { ...updatedPrices } };
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

const main = () => {
  console.log(firebaseConfig);
  firebase.initializeApp(firebaseConfig);
  console.log(59, 'ok');
  const database = firebase.database();
  console.log(61, 'ok');
  const stuffRef = database.ref('stuff');
  console.log(63, 'ok');

  stuffRef.once('value', snapshot => {
    const list = snapshot.val();
    console.log(list);
    const prices = list.map(thing => checkOne(thing));

    Promise.all(prices)
      .then(done => {
        stuffRef.set({ ...done });
        console.log('Updated...');
        process.exit();
      })
      .catch(error => console.error(error));
  });
};

main();
