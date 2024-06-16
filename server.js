const express = require('express');
const app = express();


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();

}

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const weather = require('./routes/weather');
app.use('/', weather);

const port = 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');

// set the views directory
app.set('views', './views');

// Serve static files
app.use(express.static('public'));



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

