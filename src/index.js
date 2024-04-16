const mongoose = require('mongoose');
const app = require('./app');

app.listen(port = 3000, () => {
    console.log(`Listening to port ${port}`);
});
