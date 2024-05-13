import jsPDF from 'jspdf';

const RecipeExport = ({ recipe }) => {

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const textWidth = doc.getStringUnitWidth(recipe.title) * 16 / doc.internal.scaleFactor;
        doc.text(recipe.title, 10, 10);
        doc.setLineWidth(0.5);
        doc.line(10, 12, 10 + textWidth, 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Ingredients:", 10, 25);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        recipe.ingredients.forEach((ingredient, index) => {
            doc.text(`${ index + 1 }. ${ ingredient }`, 10, 35 + (index * 10));
        });
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Steps:", 10, 45 + (recipe.ingredients.length * 10));
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
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
