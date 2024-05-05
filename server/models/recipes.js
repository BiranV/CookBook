const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    ingredients: {
        type: Array,
        required: true
    },
    steps: {
        type: Array,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Recipe', recipeSchema);