const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    title: String,
    ingredients: Array,
    steps: Array,
    image: String,
});

module.exports = mongoose.model('recipe', recipeSchema);