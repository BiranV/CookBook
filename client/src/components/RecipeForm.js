const RecipeForm = ({
    formData,
    handleTitle,
    handleIngredient,
    handleStep,
    handleIngredientCount,
    handleStepCount,
    handleImageUpload,
    handleSubmit,
    popupState,
    setPopupState
}) => {
    return (
        <div className="popup-container">
            <div className="popup-inner">
                <h2>{popupState.editMode ? "Edit" : "Add"} recipe</h2>
                <form onSubmit={handleSubmit}>
                    <label>Title</label>
                    <input name="title" type="text" value={formData.title} onChange={(e) => handleTitle(e)} />
                    <label>Ingredients</label>
                    {formData.ingredients?.map((ingredient, index) => (
                        <input type="text" key={index} value={ingredient} onChange={(e) => handleIngredient(e, index)} />
                    ))}
                    <button type="button" style={{ color: "#2F75A1" }} onClick={handleIngredientCount}>Add ingredient</button>
                    <label>Steps</label>
                    {formData.steps?.map((step, index) => (
                        <textarea type="text" key={index} value={step} onChange={(e) => handleStep(e, index)} />
                    ))}
                    <button type="button" style={{ color: "#2F75A1" }} onClick={handleStepCount}>Add step</button>
                    <input className="inputfile" type="file" onChange={handleImageUpload} />
                    <div className="container-image">
                        {formData.image && <img alt="uploaded img" src={formData.image} />}
                    </div>
                    <button type="submit" style={{ color: "#00905B" }}>Submit</button>
                    <button type="button" style={{ color: "#DB3052" }} onClick={() => setPopupState({ ...popupState, active: false })}>Close</button>
                </form>
            </div>
        </div>
    );
}

export default RecipeForm;
