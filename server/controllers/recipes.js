const Recipe = require('../models/recipes');

const handleErrorResponse = (res, error) => {
    res.status(500).json({ error: error.message });
};

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.status(200).json(recipes);
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

const createRecipe = async (req, res) => {
    try {
        const newRecipe = await Recipe.create({ ...req.body, userEmail: req.user.email });
        res.status(201).json({ obj: newRecipe, message: "Recipe added successfully" });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

const updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Check if the logged-in user is the creator of the recipe
        if (recipe.userEmail !== req.user.email) {
            return res.status(403).json({ message: 'You are not authorized to update this recipe' });
        }
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ obj: updatedRecipe, message: "Recipe updated successfully" });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Check if the logged-in user is the creator of the recipe
        if (recipe.userEmail !== req.user.email) {
            return res.status(403).json({ message: 'You are not authorized to delete this recipe' });
        }
        const result = await Recipe.findByIdAndDelete(req.params.id);
        res.status(200).json({ obj: result, message: "Recipe deleted successfully" });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

module.exports = {
    getAllRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
};
