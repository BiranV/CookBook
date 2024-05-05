// Home.jsx
import { useState, useEffect } from "react";
import Snackbar from "../components/Snackbar";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { jwtDecode } from "jwt-decode";
import RecipeCard from "../components/RecipeCard";
import RecipeForm from "../components/RecipeForm";
import ImageModal from "../components/ImageModal";
import FilterInput from "../components/FilterInput";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams({ filter: "" });
    const filter = searchParams.get("filter");

    const [formData, setFormData] = useState({
        title: "",
        ingredients: [],
        steps: [],
        image: "",
    });
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popupState, setPopupState] = useState({
        active: false,
        editMode: false,
    });
    const [popupImage, setPopupImage] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [snackbarActive, setSnackbarActive] = useState({
        show: false,
        text: "",
    });

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/auth");
                    return;
                }
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
        if (!localStorage.getItem("token")) {
            navigate("/auth");
            return;
        }
        setPopupState({ active: true, editMode: false });
        setFormData({
            title: "",
            ingredients: [],
            steps: [],
            image: "",
        });
    };

    const handleEdit = (id, image) => {
        if (!localStorage.getItem("token")) {
            navigate("/auth");
            return;
        }
        const recipe = recipes.find((recipe) => recipe._id === id);
        if (recipe) {
            if (recipe.userEmail !== getUserEmailFromToken()) {
                alert("You are not authorized to edit this recipe.");
                return;
            }
            setFormData({ ...recipe });
            setPopupState({ active: true, editMode: true });
        }
    };

    const handleDelete = async (recipe) => {
        if (!localStorage.getItem("token")) {
            navigate("/auth");
            return;
        }
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

    const getUserEmailFromToken = () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                return decodedToken.email;
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
        return null;
    };

    const handleView = (id) => {
        setRecipes((prevRecipes) =>
            prevRecipes.map((recipe) => ({
                ...recipe,
                viewing: recipe._id === id ? !recipe.viewing : false,
            }))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || formData.ingredients.length < 1 || formData.steps.length < 1 || !formData.image) {
            alert("Please fill out all fields");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/auth");
                return;
            }
            const headers = {
                Authorization: `Bearer ${ token }`,
            };
            const response = popupState.editMode
                ? await axios.put("/" + formData._id, formData, { headers })
                : await axios.post("/", { ...formData, userEmail: localStorage.getItem("userEmail") }, { headers });
            const updatedRecipes = popupState.editMode
                ? recipes.map((recipe) => (recipe._id === response.data.obj._id ? formData : recipe))
                : [...recipes, response.data.obj];
            setRecipes(updatedRecipes);
            handleSnackbar(response.data.message);
            setFormData({ title: "", ingredients: [], steps: [], image: "" });
            setPopupState({ ...popupState, active: false });
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleImageUpload = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onloadend = () => {
            setFormData({ ...formData, image: reader.result });
        };
        reader.onerror = (error) => {
            console.error("Error: ", error);
        };
    };

    const handleTitle = (e) => {
        setFormData({ ...formData, title: e.target.value });
    };

    const handleIngredient = (e, index) => {
        const ingredientsClone = [...formData.ingredients];
        ingredientsClone[index] = e.target.value;
        setFormData({ ...formData, ingredients: ingredientsClone });
    };

    const handleStep = (e, index) => {
        const stepsClone = [...formData.steps];
        stepsClone[index] = e.target.value;
        setFormData({ ...formData, steps: stepsClone });
    };

    const handleIngredientCount = () => {
        setFormData({ ...formData, ingredients: [...formData.ingredients, ""] });
    };

    const handleStepCount = () => {
        setFormData({ ...formData, steps: [...formData.steps, ""] });
    };

    const handleSnackbar = (val) => {
        setSnackbarActive({ show: true, text: val });
        setTimeout(() => {
            setSnackbarActive({ show: false, text: "" });
        }, 2000);
    };

    const openFullImage = (val) => {
        setImageUrl(val);
        setPopupImage(true);
    };

    const recipesFiltered = recipes.filter((recipe) => recipe.title.toLowerCase().includes(filter) || filter === "");

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="home-container">
            <button style={{ color: "#00905B" }} onClick={handleAdd}>Add recipe</button>
            <FilterInput
                value={filter}
                onChange={(e) => setSearchParams((prev) => { prev.set("filter", e.target.value.toLowerCase()); return prev; }, { replace: true })}
            />
            {recipesFiltered.map((recipe) => (
                <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    handleView={handleView}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    openFullImage={openFullImage}
                />
            ))}
            {popupState.active && (
                <RecipeForm
                    formData={formData}
                    popupState={popupState}
                    handleSubmit={handleSubmit}
                    handleImageUpload={handleImageUpload}
                    handleIngredient={handleIngredient}
                    handleStep={handleStep}
                    handleIngredientCount={handleIngredientCount}
                    handleStepCount={handleStepCount}
                    setPopupState={setPopupState}
                    openFullImage={openFullImage}
                    handleTitle={handleTitle}
                />
            )}
            {popupImage && (
                <ImageModal
                    imageUrl={imageUrl}
                    setPopupImage={setPopupImage}
                />
            )}
            {snackbarActive.show && <Snackbar text={snackbarActive.text} />}
        </div>
    );
}
