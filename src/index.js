const mongoose = require('mongoose');
const config = require('./config/config');
const app = require('./app');

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    console.log('Connected to MongoDB');
    server = app.listen(config.port, () => {
      console.log(`Listening to port ${config.port}`);
    });
  });

app.listen(config.port, () => {
    console.log(`Listening to port ${config.port}`);
});
