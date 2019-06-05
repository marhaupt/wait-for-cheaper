const express = require('express');
const list = require('./stuff.json');

const app = express();

const port = process.env.PORT || 3131;

app.get('/', (req, res) => {
  res.json(list);
});

app.listen(port, () =>
  console.log(`Listening @ port http://localhost:${port}`)
);
