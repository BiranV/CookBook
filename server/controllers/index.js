const Recipe = require('../models/index');

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRecipe = async (req, res) => {
    try {
        const newRecipe = new Recipe({
            title: req.body.title,
            ingredients: req.body.ingredients,
            steps: req.body.steps,
            image: req.body.image,
        });

        const savedRecipe = await newRecipe.save();
        res.json({ obj: savedRecipe, message: "added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRecipe = async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body);
        res.json({ obj: updatedRecipe, message: "edited" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const recipeDelete = await Recipe.findByIdAndDelete({ _id: req.params.id });
        res.json({ obj: recipeDelete, message: "deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
};
