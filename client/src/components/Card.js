import { jwtDecode } from "jwt-decode";

const Card = ({ recipe, handleView, handleEdit, handleDelete, openFullImage }) => {

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

    return (
        <div className="card">
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
    );
}

export default Card;
