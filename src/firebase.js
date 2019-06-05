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

const main = () => {
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  const stuffRef = database.ref('stuff');

  stuffRef.once('value', snapshot => {
    const list = snapshot.val();
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
