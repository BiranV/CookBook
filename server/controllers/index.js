const Recipe = require('../models/index');

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
        const newRecipe = await Recipe.create(req.body);
        res.status(201).json({ obj: newRecipe, message: "Recipe added successfully" });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

const updateRecipe = async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json({ obj: updatedRecipe, message: "Recipe updated successfully" });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const result = await Recipe.findByIdAndDelete({ _id: req.params.id });
        if (!result) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
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
