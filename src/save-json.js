const list = require('./stuff.json');
const fs = require('fs');
const checkOne = require('./checkOne.js');

const main = () => {
  console.log(list);
  const prices = list.map(thing => checkOne(thing));

  Promise.all(prices)
    .then(done => {
      const doneJson = JSON.stringify(done);

      fs.writeFile('./src/stuff.json', doneJson, err => {
        if (err) console.error(err);
        console.log('Updated...');
        process.exit();
      });
    })
    .catch(error => console.error(error));
};

main();
