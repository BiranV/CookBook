import { useState, useEffect } from "react";
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

const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams({ filter: "" });
    const filter = searchParams.get("filter");

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
                navigate("/auth");
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
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, [navigate]);

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
        if (!form.title || form.ingredients.length < 1 || form.steps.length < 1 || !imageUpload) {
            alert("Please fill out all fields");
            return;
        }
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
                const updatedRecipe = { ...response.data.obj, viewing: true }
                setRecipes((prevRecipes) => [...prevRecipes, updatedRecipe]);
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
    };

    const submitEditRecipe = async (e) => {
        e.preventDefault();
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
            setRecipes((prevRecipes) =>
                prevRecipes.map((recipe) => (recipe._id === updatedRecipe._id ? updatedRecipe : recipe))
            );
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

    const handleStep = (e, index) => {
        const stepsClone = [...form.steps];
        stepsClone[index] = e.target.value;
        setForm({ ...form, steps: stepsClone });
    };

    const handleIngredientCount = () => {
        setForm({ ...form, ingredients: [...form.ingredients, ""] });
    };

    const handleStepCount = () => {
        setForm({ ...form, steps: [...form.steps, ""] });
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
            <button style={{ color: "#3307B6" }} onClick={handleAdd}>Add recipe</button>
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
                <div className="popup-container">
                    <div className="popup-inner">
                        <h2>{popupState.editMode ? "Edit" : "Add"} recipe</h2>
                        <form onSubmit={popupState.editMode ? submitEditRecipe : submitAddRecipe}>
                            <label>Title</label>
                            <input name="title" type="text" value={form.title} onChange={handleTitle} />
                            <label>Ingredients</label>
                            {form.ingredients?.map((ingredient, index) => (
                                <input type="text" key={index} value={ingredient} onChange={(e) => handleIngredient(e, index)} />
                            ))}
                            <button type="button" style={{ color: "#2F75A1" }} onClick={handleIngredientCount}>Add ingredient</button>
                            <label>Steps</label>
                            {form.steps?.map((step, index) => (
                                <textarea type="text" key={index} value={step} onChange={(e) => handleStep(e, index)} />
                            ))}
                            <button type="button" style={{ color: "#2F75A1" }} onClick={handleStepCount}>Add step</button>
                            <input className="inputfile" type="file" onChange={(e) => setImageUpload(e.target.files[0])} />
                            <div className="container-image">
                                {form.image && <img alt="uploaded img" src={form.image} />}
                            </div>
                            <button type="submit" style={{ color: "#00905B" }}>Submit</button>
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
