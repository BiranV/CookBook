const express = require('express');
const router = express.Router();
const recipesControllers = require('../controllers/index');

router.get('/', recipesControllers.getAllRecipes);
router.post('/', recipesControllers.createRecipe);
router.put('/:id', recipesControllers.updateRecipe);
router.delete('/:id', recipesControllers.deleteRecipe);

module.exports = router;
