const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routers = require('./routes/index')

require('dotenv').config();

const port = process.env.PORT || 5000

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
})

app.use('/api', routers);

app.listen(port, () => {
    console.log(`Server is running on port: ${ port }`)
});

