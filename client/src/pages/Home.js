import { useState, useEffect } from "react";
import { useGuestMode } from '../context/GuestModeContext';
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

const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams({ filter: "" });
    const filter = searchParams.get("filter");
    const { setGuestMode, guestMode } = useGuestMode();

    const [recipes, setRecipes] = useState([]);
    const [imageUpload, setImageUpload] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [popupImage, setPopupImage] = useState(false);
    const [form, setForm] = useState({
        title: "",
        ingredients: [],
        steps: [],
        image: ""
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
        const checkLoggedIn = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setGuestMode(true);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get("/", {
                    headers: {
                        Authorization: `Bearer ${ token }`,
                    },
                    params: {
                        userEmail: localStorage.getItem("userEmail"),
                    },
                });
                setRecipes(response.data);
                setGuestMode(false);
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, [navigate, guestMode]);

    const handleAdd = () => {
        setPopupState({ active: true, editMode: false });
        setForm({
            title: "",
            ingredients: [],
            steps: [],
            image: "",
        });
    };

    const handleEdit = (id) => {
        const recipe = recipes.find((recipe) => recipe._id === id);
        if (recipe) {
            if (recipe.userEmail !== getUserEmailFromToken()) {
                alert("You are not authorized to edit this recipe.");
                return;
            }
            setForm({ ...recipe });
            setImageUrl(recipe.image);
            setPopupState({ active: true, editMode: true });
        }
    };

    const handleDelete = async (recipe) => {
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

            const imageRef = ref(storage, recipe.image);
            await deleteObject(imageRef);

            const response = await axios.delete("/" + recipe._id, { headers });
            setRecipes((prevRecipes) => prevRecipes.filter((prevRecipe) => prevRecipe._id !== recipe._id));
            handleSnackbar(response.data.message);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleView = (id) => {
        setRecipes((prevRecipes) =>
            prevRecipes.map((recipe) => ({
                ...recipe,
                viewing: recipe._id === id ? !recipe.viewing : false,
            }))
        );
    };

    const submitAddRecipe = async (e) => {
        e.preventDefault();

        if (!form.title || form.ingredients.some(ingredient => !ingredient.trim()) || form.steps.some(step => !step.trim()) || !imageUpload || form.ingredients.length < 1 || form.steps.length < 1) {
            alert("Please fill out all fields");
            return;
        }
        setLoading(true);
        try {
            const imageRef = ref(storage, `images/${ uuidv4() }`);
            await uploadBytes(imageRef, imageUpload);
            const imageUrl = await getDownloadURL(imageRef);
            const updatedForm = { ...form, image: imageUrl };
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
                setForm({ title: "", ingredients: [], steps: [], image: "" });
                setPopupState({ ...popupState, active: false });
            } catch (error) {
                console.error(error.message);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setSnackbar("Failed to upload image");
        }
        setLoading(false);
    };

    const submitEditRecipe = async (e) => {
        e.preventDefault();

        if (!form.title || form.ingredients.some(ingredient => !ingredient.trim()) || form.steps.some(step => !step.trim()) || form.ingredients.length < 1 || form.steps.length < 1) {
            alert("Please fill out all fields");
            return;
        }
        setLoading(true);
        const editedForm = { ...form };
        try {
            if (imageUpload) {
                const previousImageRef = ref(storage, editedForm.image);
                try {
                    await deleteObject(previousImageRef);
                } catch (error) {
                    console.error('Error deleting previous image:', error);
                }
                const newImageRef = ref(storage, `images/${ uuidv4() }`);
                try {
                    await uploadBytes(newImageRef, imageUpload);
                    const imageUrl = await getDownloadURL(newImageRef);
                    editedForm.image = imageUrl;
                } catch (error) {
                    console.error('Error uploading new image:', error);
                }
            }
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${ token }` };
            const response = await axios.put(editedForm._id, editedForm, { headers });
            const updatedRecipe = { ...response.data.obj, viewing: true };
            const updatedRecipes = recipes.map((recipe) => ({
                ...recipe,
                viewing: recipe._id === updatedRecipe._id ? true : false,
                image: recipe._id === updatedRecipe._id ? updatedRecipe.image : recipe.image

            }));
            setRecipes(updatedRecipes);
            handleSnackbar(response.data.message);
            setForm({ title: "", ingredients: [], steps: [], image: "" });
            setPopupState({ ...popupState, active: false });
        } catch (error) {
            console.error('Error updating movie:', error);
        }
        setLoading(false);
    };

    const handleTitle = (e) => {
        setForm({ ...form, title: e.target.value });
    };

    const handleIngredient = (e, index) => {
        const ingredientsClone = [...form.ingredients];
        ingredientsClone[index] = e.target.value;
        setForm({ ...form, ingredients: ingredientsClone });
    };

    const handleIngredientCount = () => {
        setForm({ ...form, ingredients: [...form.ingredients, ""] });
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

    const handleStepCount = () => {
        setForm({ ...form, steps: [...form.steps, ""] });
    };

    const handleRemoveStep = (index) => {
        const stepsClone = [...form.steps];
        stepsClone.splice(index, 1);
        setForm({ ...form, steps: stepsClone });
    };

    const handleSnackbar = (val) => {
        setSnackbar({ show: true, text: val });
        setTimeout(() => {
            setSnackbar({ show: false, text: "" });
        }, 2000);
    };

    const openFullImage = (val) => {
        setImageUrl(val);
        setPopupImage(true);
    };

    const recipesFiltered = recipes.filter((recipe) => recipe.title.toLowerCase().includes(filter) || filter === "");

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="home-container">
            {guestMode && <p>You are currently in guest mode. Some functionalities are disabled.</p>}
            {!guestMode && <button onClick={handleAdd}>Add recipe</button>}
            <Filter
                value={filter}
                onChange={(e) => setSearchParams((prev) => { prev.set("filter", e.target.value.toLowerCase()); return prev; }, { replace: true })}
            />
            {recipesFiltered.map((recipe) => (
                <div className="card" key={recipe._id}>
                    <div className="container-card">
                        <div>
                            <h2>{recipe.title}</h2>
                        </div>
                        <div>
                            {recipe.viewing && (
                                <div>
                                    <label>Ingredients</label>
                                    <ul>{recipe.ingredients.map((ingredient, index) => (<li key={index}>{ingredient}</li>))}</ul>
                                    <label>Steps</label>
                                    <ol>{recipe.steps.map((step, index) => (<li key={index}>{step}</li>))}</ol>
                                </div>
                            )}
                        </div>
                        <div className="buttons">
                            <button style={{ color: "#2F75D1" }} onClick={() => handleView(recipe._id)}>View {recipe.viewing ? "less" : "more"}</button>
                            {getUserEmailFromToken() === recipe.userEmail && (
                                <>
                                    <button style={{ color: "#D07C2E" }} onClick={() => handleEdit(recipe._id, recipe.image)}>Edit</button>
                                    <button style={{ color: "#DB3052" }} onClick={() => handleDelete(recipe)}>Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="container-image">
                        <img src={recipe.image} alt="uploaded img" onClick={() => { openFullImage(recipe.image); }} />
                    </div>
                </div>
            ))}
            {popupState.active && (
                <div className="popup">
                    <div className="inner">
                        <h2>{popupState.editMode ? "Edit" : "Add"} recipe</h2>
                        <form onSubmit={popupState.editMode ? submitEditRecipe : submitAddRecipe}>
                            <label>Title</label>
                            <input name="title" type="text" value={form.title} onChange={handleTitle} />
                            <label>Ingredients</label>
                            {form.ingredients?.map((ingredient, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="text" value={ingredient} onChange={(e) => handleIngredient(e, index)} />
                                    <DeleteOutlineIcon style={{ cursor: 'pointer' }} className="icon" onClick={() => handleRemoveIngredient(index)} />
                                </div>
                            ))}
                            <button type="button" style={{ color: "#2F75A1" }} onClick={handleIngredientCount}>Add ingredient</button>
                            <label>Steps</label>
                            {form.steps?.map((step, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                    <textarea value={step} onChange={(e) => handleStep(e, index)} />
                                    <DeleteOutlineIcon style={{ cursor: 'pointer' }} className="icon" onClick={() => handleRemoveStep(index)} />
                                </div>
                            ))}
                            <button type="button" style={{ color: "#2F75A1" }} onClick={handleStepCount}>Add step</button>
                            <input className="inputfile" type="file" onChange={(e) => setImageUpload(e.target.files[0])} />
                            <div className="container-image">
                                {form.image && <img alt="uploaded img" src={form.image} />}
                            </div>
                            <button type="submit" disabled={loading} style={{ color: "#00905B" }}>Submit</button>
                            <button type="button" style={{ color: "#DB3052" }} onClick={() => setPopupState({ ...popupState, active: false })}>Close</button>
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
