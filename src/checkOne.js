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

// checkOne
module.exports = async ({ prices, ...rest }) => {
  const html = await rp(rest.url);
  const price = await scrape(html);
  const time = new Date().getTime();
  const updatedPrices = simplifyPrices({ ...prices, [time]: price });

  return { ...rest, prices: { ...updatedPrices } };
};
