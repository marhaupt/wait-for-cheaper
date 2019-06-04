var express = require('express');

const app = express();

const port = process.env.PORT || 3131;

app.get('/', (req, res) => {
  res.json({ resp: 'onse' });
});

app.listen(port, () =>
  console.log(`Listening @ port http://localhost:${port}`)
);
