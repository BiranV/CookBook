import SwapVertIcon from '@mui/icons-material/SwapVert';

const SortOptions = ({ sortOrder, handleSort }) => {
    return (
        <div className="sort-options">
            <select value={sortOrder} onChange={(e) => handleSort(e.target.value)}>
                <option value="" >Title</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
            </select>
            <SwapVertIcon className="icon" />
            <select value={sortOrder} onChange={(e) => handleSort(e.target.value)}>
                <option value="" >Date</option>
                <option value="new-old">Newer to Older</option>
                <option value="old-new">Older to Newer</option>
            </select>
        </div >
    );
};

export default SortOptions;
