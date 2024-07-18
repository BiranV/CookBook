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

const sendMessage = async (req, res) => {
    const { recipient, message } = req.body;
    const senderEmail = req.user.email; // Assuming req.user.email is set by verifyToken middleware

    try {
        // Check if recipient exists (you might need to adjust this logic)
        const recipientUser = await User.findOne({ email: recipient });
        if (!recipientUser) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Save message in database
        const newMessage = await Message.create({ sender: senderEmail, recipient, message });

        return res.status(201).json({ message: 'Message sent successfully', obj: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Failed to send message' });
    }
};

const getMessages = async (req, res) => {
    const userEmail = req.user.email;

    try {
        // Retrieve messages where the authenticated user is either sender or recipient
        const messages = await Message.find({ $or: [{ sender: userEmail }, { recipient: userEmail }] });

        return res.status(200).json(messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        return res.status(500).json({ message: 'Failed to retrieve messages' });
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
    sendMessage,
    getMessages
};
