const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();

dotenv.config();
app.use(cors());

// Bodyparser Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log(req.method, fullUrl);
  console.log('HEADERS', req.headers);
  console.log('PARAMS', req.params);
  console.log('QUERY', req.query);
  console.log('BODY', req.body);
  console.log(
    '--------------------------------------------------------------------------------------------'
  );
  next();
});

const env = process.env.NODE_ENV || 'development';

// DB Config
let db = process.env.MONGO_URI;
if (env === 'test') {
  db = process.env.MONGO_TEST_URI;
}

// Connect to Mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Use Routes

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));

// Route to seed DB (would generally be done another means)
app.use('/jobs/seed', require('./routes/jobs/seed'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on ${port}`));

module.exports = app;
