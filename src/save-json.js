require('dotenv').config();
const rp = require('request-promise');
const cheerio = require('cheerio');
const list = require('./stuff.json');
const fs = require('fs');

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

const checkOne = async ({ prices, ...rest }) => {
  const html = await rp(rest.url);
  const price = await scrape(html);
  const time = new Date().getTime();
  const updatedPrices = simplifyPrices({ ...prices, [time]: price });

  return { ...rest, prices: { ...updatedPrices } };
};

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
