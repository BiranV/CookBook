const ImageModal = ({ imageUrl, setPopupImage }) => {

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setPopupImage(false);
        } else setPopupImage(false)
    };

    return (
        <div className="popup">
            <div className="zoom-img">
                <img className="full-image" alt="uploaded img" src={imageUrl} />
                <button className="close-btn" onClick={(e) => { handleKeyDown(e) }}>Close</button>
            </div>
        </div>
    );
}

export default ImageModal;