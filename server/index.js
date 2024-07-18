const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routers = require('./routes/index')
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

// Routes
app.use('/', routers);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${ port }`);
});