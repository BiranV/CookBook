const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const recipeSchema = new Schema({
    title: String,
    ingredients: Array,
    steps: Array,
    image: String,
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe 