import React from 'react';

const ImageModal = ({ imageUrl, setPopupImage }) => {
    return (
        <div className="popup">
            <div className="zoom-img">
                <img className="full-image" alt="uploaded img" src={imageUrl} />
                <button style={{ color: "#DB3052", marginTop: "0.5rem" }} onClick={() => { setPopupImage(false) }}>Close</button>
            </div>
        </div>
    );
}

export default ImageModal;
