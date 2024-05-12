const Filter = ({ value, onChange }) => {
    return (
        <input
            placeholder="Filter"
            value={value}
            className="filter"
            id="filter"
            name="filter"
            type="text"
            onChange={onChange}
        />
    );
}

export default Filter;
