const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/auth');
const recipesControllers = require('../controllers/recipes');
const { verifyToken } = require('../middlewares/auth');

// Authentication routes
router.post('/login', authControllers.login);
router.post('/signup', authControllers.signup);

// Recipe routes (protected with verifyToken middleware)
router.get('/', verifyToken, recipesControllers.getAllRecipes);
router.post('/', verifyToken, recipesControllers.createRecipe);
router.put('/:id', verifyToken, recipesControllers.updateRecipe);
router.delete('/:id', verifyToken, recipesControllers.deleteRecipe);

module.exports = router;
