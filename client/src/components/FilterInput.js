const FilterInput = ({ value, onChange }) => {
    return (
        <input
            placeholder="Filter"
            value={value}
            className="filter"
            id="filter"
            name="filter"
            style={{ width: "40%", margin: "1rem auto" }}
            type="text"
            onChange={onChange}
        />
    );
}

export default FilterInput;
