const router = require('express').Router();
const Recipe = require('../models/recipes');

router.get('/', async (req, res) => {
    const recipes = await Recipe.find();
    res.json(recipes)
})

router.post('/', async (req, res) => {
    const newRecipe = new Recipe({
        title: req.body.title,
        ingredients: req.body.ingredients,
        steps: req.body.steps,
        image: req.body.image,
    })

    const saveRecipe = await newRecipe.save()
    res.json({ obj: saveRecipe, message: "added" })
});

router.put('/:id', async (req, res) => {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body)
    res.json({ obj: updatedRecipe, message: "edited" })

})

router.delete('/:id', async (req, res) => {
    const recipeDelete = await Recipe.findByIdAndDelete({ _id: req.params.id })
    res.json({ obj: recipeDelete, message: "deleted" })
})

module.exports = router;