import React, { useRef, useState } from 'react';
import './ImageGenerator.css';
import default_image from '../Assets/logo2.gif';

const ImageGenerator = () => {
    const [imageUrl, setImageUrl] = useState(default_image);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    let lastRequestTime = 0; // Track the last request time
    const requestDelay = 60000; // 1 minute in milliseconds

    const imageGenerator = async () => {
        if (!inputRef.current.value.trim()) {
            setError("Please enter a prompt to generate an image.");
            return;
        }
        setError(null);

        const currentTime = Date.now();
        if (currentTime - lastRequestTime < requestDelay) {
            setError("Please wait before making another request.");
            return;
        }

        lastRequestTime = currentTime;

        try {
            const response = await fetch("https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.REACT_APP_HF_API_KEY}`,
                },
                body: JSON.stringify({
                    inputs: inputRef.current.value,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate image");
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageUrl(imageUrl);
        } catch (error) {
            setError("An error occurred. Please try again.");
            console.error("API error:", error.message);
        }
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="ai-image-generator">
            <div className="header">AI Image <span>Generator</span></div>
            <div className="img-loading">
                <img src={imageUrl} alt="Generated" />
            </div>
            <div className="input-container">
                <div className="search-box">
                    <input
                        type="text"
                        ref={inputRef}
                        className="search-input"
                        placeholder="Describe what you want to see"
                    />
                    <button className="generate-btn" onClick={imageGenerator}>Generate</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {imageUrl !== default_image && (
                    <button className="download-btn" onClick={downloadImage}>
                        Download Image
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
