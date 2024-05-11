import { useState, useEffect } from "react";
import { useAuthMode } from '../context/AuthModeContext';
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserEmailFromToken } from "../utils/authUtils";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../firebase";
import axios from "../api/axios";
import ImageModal from "../components/ImageModal";
import Filter from "../components/Filter";
import Spinner from "../components/Spinner";
import Snackbar from "../components/Snackbar";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RecipeExport from '../components/RecipeExport';

const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams({ filter: "" });
    const filter = searchParams.get("filter");
    const { authMode, setAuthMode } = useAuthMode();

    const [recipes, setRecipes] = useState([]);
    const [imagesUpload, setImagesUpload] = useState([]);
    const [imageUrl, setImageUrl] = useState([]);
    const [previousImagesUrls, setPreviousImagesUrls] = useState([]);
    const [popupImage, setPopupImage] = useState(false);
    const [form, setForm] = useState({
        title: "",
        ingredients: [],
        steps: [],
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [popupState, setPopupState] = useState({
        active: false,
        editMode: false,
    });
    const [snackbar, setSnackbar] = useState({
        show: false,
        text: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        setAuthMode(!!token);

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/");
                setRecipes(response.data);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, authMode]);

    const handleView = (id) => {
        setRecipes((prevRecipes) =>
            prevRecipes.map((recipe) => ({
                ...recipe,
                viewing: recipe._id === id ? !recipe.viewing : recipe.viewing,
            }))
        );
    };

    const handleAdd = () => {
        setPopupState({ active: true, editMode: false });
        setForm({
            title: "",
            ingredients: [],
            steps: [],
            images: [],
        });
    };

    const submitAdd = async (e) => {
        e.preventDefault();

        if (!form.title || form.ingredients.some(ingredient => !ingredient.trim()) || form.steps.some(step => !step.trim()) || !imagesUpload || form.ingredients.length < 1 || form.steps.length < 1) {
            alert("Please fill out all fields");
            return;
        }
        setLoading(true);
        try {

            const imageRefs = Array.from({ length: imagesUpload.length }, () => ref(storage, `images/${ uuidv4() }`));

            await Promise.all(imagesUpload.map(async (file, index) => {
                await uploadBytes(imageRefs[index], file);
            }));

            const imagesUrls = await Promise.all(imageRefs.map(async (imageRef) => {
                return await getDownloadURL(imageRef);
            }));

            const updatedForm = { ...form, images: imagesUrls };

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/auth");
                    return;
                }
                const headers = {
                    Authorization: `Bearer ${ token }`,
                };
                const response = await axios.post("/", { ...updatedForm, userEmail: localStorage.getItem("userEmail") }, { headers });
                const updatedRecipe = { ...response.data.obj, viewing: true }; // Set viewing to true
                const updatedRecipes = recipes.map((recipe) => ({
                    ...recipe,
                    viewing: false,
                }));
                setRecipes([...updatedRecipes, updatedRecipe]);
                handleSnackbar(response.data.message);
                setForm({ title: "", ingredients: [], steps: [], images: [] });
                setPopupState({ ...popupState, active: false });
                setImagesUpload([])
            } catch (error) {
                console.error(error.message);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setSnackbar("Failed to upload image");
        }
        setLoading(false);
    };

    const handleEdit = (id) => {
        const recipe = recipes.find((recipe) => recipe._id === id);
        if (recipe) {
            if (recipe.userEmail !== getUserEmailFromToken()) {
                alert("You are not authorized to edit this recipe.");
                return;
            }
            setForm({ ...recipe });
            setPreviousImagesUrls([...recipe.images]);
            setPopupState({ active: true, editMode: true });
        }
    };
    const submitEdit = async (e) => {
        e.preventDefault();

        if (!form.title || form.ingredients.some(ingredient => !ingredient.trim()) || form.steps.some(step => !step.trim()) || form.ingredients.length < 1 || form.steps.length < 1) {
            alert("Please fill out all fields");
            return;
        }

        const remainingImages = form.images.length - imagesUpload.length;
        if (remainingImages === 0) {
            alert("Please keep at least one existing image or upload a new one");
            return;
        }

        setLoading(true);
        const editedForm = { ...form };

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${ token }` };

            if (imagesUpload.length > 0) {
                // Upload new images and get their download URLs
                const newImageRefs = Array.from({ length: imagesUpload.length }, () => ref(storage, `images/${ uuidv4() }`));

                await Promise.all(imagesUpload.map(async (file, index) => {
                    await uploadBytes(newImageRefs[index], file);
                }));

                const newImageUrls = await Promise.all(newImageRefs.map(async (imageRef) => {
                    return await getDownloadURL(imageRef);
                }));

                editedForm.images = [...editedForm.images, ...newImageUrls];
            }

            // Identify removed images
            const removedImagesUrls = previousImagesUrls.filter(prevImageUrl => !editedForm.images.includes(prevImageUrl));

            await Promise.all(removedImagesUrls.map(async (removedImageUrl) => {
                try {
                    const imageRef = ref(storage, removedImageUrl);
                    await deleteObject(imageRef);
                } catch (error) {
                    console.error('Error deleting image:', error);
                }
            }));

            const response = await axios.put(editedForm._id, editedForm, { headers });
            const updatedRecipe = { ...response.data.obj };
            setRecipes(prevRecipes => prevRecipes.map(recipe => recipe._id === updatedRecipe._id ? updatedRecipe : recipe));
            handleSnackbar(response.data.message);
            setForm({ title: "", ingredients: [], steps: [], images: [] });
            setPopupState({ ...popupState, active: false });
            setImagesUpload([])
        } catch (error) {
            console.error('Error updating recipe:', error);
        }
        setLoading(false);
    };

    const submitDelete = async (recipe) => {
        const result = window.confirm(`Are you sure want to delete ${ recipe.title } recipe?`);
        if (!result) return;

        try {
            const token = localStorage.getItem("token");
            const headers = {
                Authorization: `Bearer ${ token }`,
            };

            // Check if the logged-in user is the creator of the recipe
            if (recipe.userEmail !== getUserEmailFromToken()) {
                alert("You are not authorized to delete this recipe.");
                return;
            }

            const imageRefs = recipe.images.map(imageUrl => ref(storage, imageUrl));

            // Delete images concurrently
            await Promise.all(imageRefs.map(async (imageRef) => {
                try {
                    await deleteObject(imageRef);
                } catch (error) {
                    console.error('Error deleting image:', error);
                }
            }));

            const response = await axios.delete("/" + recipe._id, { headers });
            setRecipes((prevRecipes) => prevRecipes.filter((prevRecipe) => prevRecipe._id !== recipe._id));
            handleSnackbar(response.data.message);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleIngredient = (e, index) => {
        const ingredientsClone = [...form.ingredients];
        ingredientsClone[index] = e.target.value;
        setForm({ ...form, ingredients: ingredientsClone });
    };

    const handleRemoveIngredient = (index) => {
        const ingredientsClone = [...form.ingredients];
        ingredientsClone.splice(index, 1);
        setForm({ ...form, ingredients: ingredientsClone });
    };

    const handleStep = (e, index) => {
        const stepsClone = [...form.steps];
        stepsClone[index] = e.target.value;
        setForm({ ...form, steps: stepsClone });
    };

    const handleRemoveStep = (index) => {
        const stepsClone = [...form.steps];
        stepsClone.splice(index, 1);
        setForm({ ...form, steps: stepsClone });
    };

    const handleRemoveImage = (index) => {
        const updatedImages = [...form.images];
        updatedImages.splice(index, 1);
        setForm({ ...form, images: updatedImages });
    };

    const handleSnackbar = (val) => {
        setSnackbar({ show: true, text: val });
        setTimeout(() => {
            setSnackbar({ show: false, text: "" });
        }, 2000);
    };

    const openFullImage = (url) => {
        setImageUrl(url);
        setPopupImage(true);
    };

    const recipesFiltered = recipes.filter((recipe) => recipe.title.toLowerCase().includes(filter) || filter === "");

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="home-container">
            {!authMode && <p>You are currently in guest mode. Some functionalities are disabled.</p>}
            {authMode && <button className="add-btn" onClick={handleAdd}>Add recipe</button>}
            <Filter
                value={filter}
                onChange={(e) => setSearchParams((prev) => { prev.set("filter", e.target.value.toLowerCase()); return prev; }, { replace: true })}
            />
            {recipesFiltered.map((recipe) => (
                <div className="card" key={recipe._id}>
                    <h2>{recipe.title}</h2>
                    <h5>Updated date: {new Date(recipe.updatedAt).getDate()}/{new Date(recipe.updatedAt).getMonth() + 1}/{new Date(recipe.updatedAt).getFullYear()}</h5>
                    {recipe.viewing && (
                        <div>
                            <label>Ingredients</label>
                            <ul>{recipe.ingredients.map((ingredient, index) => (<li key={index}>{ingredient}</li>))}</ul>
                            <label>Steps</label>
                            <ol>{recipe.steps.map((step, index) => (<li key={index}>{step}</li>))}</ol>
                        </div>
                    )}
                    <div className="container-images">
                        {recipe.images.map((image, index) => (

                            <img key={index} src={image} alt="uploaded img" onClick={() => { openFullImage(image); }} />
                        ))}
                    </div>
                    <div className="container-buttons">
                        <button className="view-btn" onClick={() => handleView(recipe._id)}>View {recipe.viewing ? "less" : "more"}</button>
                        {authMode && getUserEmailFromToken() === recipe.userEmail && (
                            <>
                                <button className="edit-btn" onClick={() => handleEdit(recipe._id)}>Edit</button>
                                <button className="delete-btn" onClick={() => submitDelete(recipe)}>Delete</button>
                            </>
                        )}
                        <RecipeExport recipe={recipe} />
                    </div>
                </div>
            ))}
            {popupState.active && (
                <div className="popup">
                    <div className="inner">
                        <h2>{popupState.editMode ? "Edit" : "Add"} recipe</h2>
                        <form onSubmit={popupState.editMode ? submitEdit : submitAdd}>
                            <label>Title</label>
                            <input name="title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            <label>Ingredients</label>
                            {form.ingredients?.map((ingredient, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="text" value={ingredient} onChange={(e) => handleIngredient(e, index)} />
                                    <DeleteOutlineIcon className="icon" onClick={() => handleRemoveIngredient(index)} />
                                </div>
                            ))}
                            <button className="add-btn" type="button" onClick={() => setForm({ ...form, ingredients: [...form.ingredients, ""] })}>Add ingredient</button>
                            <label>Steps</label>
                            {form.steps?.map((step, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                    <textarea value={step} onChange={(e) => handleStep(e, index)} />
                                    <DeleteOutlineIcon className="icon" onClick={() => handleRemoveStep(index)} />
                                </div>
                            ))}
                            <button className="add-btn" type="button" onClick={() => setForm({ ...form, steps: [...form.steps, ""] })
                            }>Add step</button>
                            <input className="inputfile" type="file" onChange={(e) => setImagesUpload(Array.from(e.target.files))} multiple />
                            <div className="container-image">
                                {form.images && form.images.map((image, index) => (
                                    <span key={index} className="image-container">
                                        <img key={index} alt="uploaded img" src={image} />
                                        <DeleteOutlineIcon className="icon" onClick={() => handleRemoveImage(index)} />
                                    </span>
                                ))}
                            </div>
                            <div className="container-buttons">
                                <button className="submit-btn" type="submit" disabled={loading}>Submit</button>
                                <button className="close-btn" type="button" onClick={() => setPopupState({ ...popupState, active: false })}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {popupImage && (
                <ImageModal
                    imageUrl={imageUrl}
                    setPopupImage={setPopupImage}
                />
            )}
            {snackbar.show && <Snackbar text={snackbar.text} />}
        </div>
    );
};

export default Home;
