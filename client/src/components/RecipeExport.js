import jsPDF from 'jspdf';

const RecipeExport = ({ recipe }) => {

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text(recipe.title, 10, 10);
        doc.text("Ingredients:", 10, 25);
        recipe.ingredients.forEach((ingredient, index) => {
            doc.text(`${ index + 1 }. ${ ingredient }`, 10, 35 + (index * 10));
        });
        doc.text("Steps:", 10, 45 + (recipe.ingredients.length * 10));
        recipe.steps.forEach((step, index) => {
            doc.text(`${ index + 1 }. ${ step }`, 10, 55 + (recipe.ingredients.length * 10) + (index * 10));
        });
        doc.save(`${ recipe.title }.pdf`);
    };

    return (
        <button className="pdf-btn" onClick={handleExportPDF}>Export PDF</button>
    );
};

export default RecipeExport;
