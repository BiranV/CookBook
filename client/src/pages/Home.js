import { useState, useEffect } from "react";
import Snackbar from "../components/Snackbar";
import { useSearchParams } from "react-router-dom"
import axios from 'axios';

export default function Recipes() {

    const URL = 'http://localhost:5000/api/'

    const [searchParams, setSearchParams] = useSearchParams({ filter: "" })
    const filter = searchParams.get("filter")

    const [form, setForm] = useState({
        title: "",
        ingredients: [],
        steps: [],
        image: "",
    });
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [popupActive, setPopupActive] = useState(false);
    const [popupImage, setPopupImage] = useState(false);
    const [fullImage, setFullImage] = useState("");
    const [snackbarActive, setSnackbarActive] = useState({
        show: false,
        text: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await axios.get(URL);
                setRecipes(response.data);
            } catch (error) {
                console.error(error.message);
            }
            setLoading(false)
        }
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditMode(false);
        setForm({
            title: "",
            ingredients: [],
            steps: [],
            image: "",
        });
        setPopupActive(true);
    };
    const handleEdit = (id) => {
        recipes.forEach((recipe) => {
            if (recipe._id === id) {
                setForm({ ...recipe })
                setEditMode(true)
                setPopupActive(true)
            }
        });
    };
    const handleDelete = async (id) => {
        const newItems = recipes.filter((item) => (item._id !== id));
        try {
            const response = await axios.delete(URL + id);
            handleSnackbar(response.data.message)
            setRecipes(newItems);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleView = (id) => {
        const updatedRecipes = [...recipes]
        updatedRecipes.forEach((recipe) => {
            if (recipe._id === id) {
                recipe.viewing = !recipe.viewing
            } else { recipe.viewing = false };
        });
        setRecipes(updatedRecipes)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !form.title ||
            form.ingredients.length < 1 ||
            form.steps.length < 1
            || !form.image
        ) {
            alert("Please fill out all fields");
            return;
        } else {
            const exist = [...recipes].filter((item => item._id === form._id))
            if (exist.length > 0) {
                try {
                    const response = await axios.put(URL + form._id, form);
                    setRecipes(prev => prev.map(recipe => {
                        if (recipe._id === response.data.obj._id) {
                            handleSnackbar(response.data.message);
                            setForm({ title: "", ingredients: [], steps: [], image: "" });
                            setPopupActive(false);
                            return form;
                        }
                        return recipe;
                    })
                    );

                } catch (error) {
                    console.error(error.message);
                }
            } else {
                try {
                    const response = await axios.post(URL, form)
                    const newRecipe = response.data.obj;
                    setRecipes(prev => [...prev, newRecipe]);
                    handleSnackbar(response.data.message);
                    setForm({ title: "", ingredients: [], steps: [], image: "" });
                    setPopupActive(false);
                } catch (error) {
                    console.error(error.message);
                }
            }
        }
    };

    const handleImageUpload = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onloadend = () => {
            setForm({ ...form, image: reader.result });
        };
        reader.onerror = (error) => {
            console.log("Error: ", error)
        };
    };

    const handleIngredient = (e, index) => {
        const ingredientsClone = [...form.ingredients];
        ingredientsClone[index] = e.target.value;
        setForm({
            ...form,
            ingredients: ingredientsClone,
        });
    };
    const handleStep = (e, index) => {
        const stepsClone = [...form.steps];
        stepsClone[index] = e.target.value;
        setForm({
            ...form,
            steps: stepsClone,
        });
    };
    const handleIngredientCount = () => {
        setForm({ ...form, ingredients: [...form.ingredients, ""] });
    };

    const handleStepCount = () => {
        setForm({ ...form, steps: [...form.steps, ""] });
    };

    const handleSnackbar = (val) => {
        setSnackbarActive({ show: true, text: val });
        setTimeout(() => {
            setSnackbarActive({ show: false, text: "" });
        }, 2000);
    };

    const openFullImage = (val) => {
        setFullImage(val)
        setPopupImage(true)
    }

    const recipesFiltered = recipes.filter(recipe => recipe.title.toLowerCase().includes(filter) || filter === '')
    console.log(recipesFiltered)

    if (loading) {
        return <div className="spinner-container"><div className="loading-spinner"></div></div>
    }
    return (
        <div className="recipes">
            <button style={{ color: "#00905B" }} onClick={handleAdd}>Add recipe</button>
            <div className="filter">
                <input placeholder="Filter" value={filter} id="filter" name="filter" style={{ width: "40%" }} type="text"
                    onChange={e => setSearchParams(prev => {
                        prev.set("filter", e.target.value.toLowerCase())
                        return prev;
                    }, { replace: true })
                    } />
            </div>
            {recipesFiltered.map((recipe) => (
                <div className="card" key={recipe._id}>
                    <div className="container-card">
                        <div><h2>{recipe.title}</h2></div>
                        <div>
                            {recipe.viewing && (
                                <div>
                                    <label>Ingredients</label>
                                    <ul>
                                        {recipe.ingredients.map((ingredient, index) => (
                                            <li key={index}>{ingredient}</li>
                                        ))}
                                    </ul>
                                    <label>Steps</label>
                                    <ol>
                                        {recipe.steps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}</div>
                        <div className="buttons">
                            <button
                                style={{ color: "#2F75D1" }}
                                onClick={() => handleView(recipe._id)}
                            >
                                View {recipe.viewing ? "less" : "more"}
                            </button>
                            <button
                                style={{ color: "#D07C2E" }}
                                onClick={() => handleEdit(recipe._id, recipe.image)}
                            >
                                Edit
                            </button>
                            <button
                                style={{ color: "#DB3052" }}
                                onClick={() => handleDelete(recipe._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="container-image"> <img src={recipe.image} alt="uploaded img" onClick={() => { openFullImage(recipe.image) }} /></div>
                </div>
            ))}

            {popupActive && (
                <div className="popup-container">
                    <div className="popup-inner">
                        <h2>{editMode ? "Edit" : "Add"} recipe</h2>
                        <form onSubmit={handleSubmit}>
                            <label>Title</label>
                            <input
                                name="title"
                                type="text"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                }
                            />
                            <label>Ingredients</label>
                            {form.ingredients?.map((ingredient, index) => (
                                <input
                                    type="text"
                                    key={index}
                                    value={ingredient}
                                    onChange={(e) => handleIngredient(e, index)}
                                />
                            ))}
                            <button
                                type="button"
                                style={{ color: "#2F75A1" }}
                                onClick={handleIngredientCount}
                            >
                                Add igredient
                            </button>
                            <label>Steps</label>
                            {form.steps?.map((step, index) => (
                                <textarea
                                    type="text"
                                    key={index}
                                    value={step}
                                    onChange={(e) => handleStep(e, index)}
                                />
                            ))}
                            <button
                                type="button"
                                style={{ color: "#2F75A1" }}
                                onClick={handleStepCount}
                            >
                                Add step
                            </button>
                            <input
                                className="inputfile"
                                type="file"
                                onChange={handleImageUpload}
                            />
                            {form.image === "" || form.image === null ? "" : <img alt="uploaded img" width={100} height={100} src={form.image} style={{ display: "block", marginBottom: "0.5rem" }} />}
                            <button type="submit" style={{ color: "#00905B" }}>
                                Submit
                            </button>
                            <button
                                type="button"
                                style={{ color: "#DB3052" }}
                                onClick={() => setPopupActive(false)}
                            >
                                Close
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {popupImage &&
                <div className="popup-container">
                    <div className="zoom-img">
                        <img className="full-image" alt="uploaded img" src={fullImage} />
                        <button style={{ color: "#DB3052", marginTop: "0.5rem" }} onClick={() => { setPopupImage(false) }}>Close</button>
                    </div>
                </div>
            }
            {snackbarActive.show && <Snackbar text={snackbarActive.text} />}
        </div>
    );
}
