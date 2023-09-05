const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const port = process.env.PORT || 5000

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));


mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
})

const recipesRouter = require('./routes/recipes')
app.use('/api', recipesRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${ port }`)
});

