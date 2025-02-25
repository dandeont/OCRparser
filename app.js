document.getElementById('ocrButton').addEventListener('click', performOCR);

async function performOCR() {
    const imageInput = document.getElementById('imageInput');
    const outputText = document.getElementById('outputText');

    if (imageInput.files.length === 0) {
        alert('Please upload an image.');
        return;
    }

    const imageFile = imageInput.files[0];
    outputText.innerText = 'Processing...';

    try {
        // Initialize Tesseract.js
        const worker = await Tesseract.createWorker({
            logger: (m) => console.log(m), // Optional: Log progress
        });

        // Load the English language model
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        // Perform OCR on the image
        const { data: { text } } = await worker.recognize(imageFile);
        outputText.innerText = text;

        // Terminate the worker
        await worker.terminate();
    } catch (error) {
        outputText.innerText = 'Error: ' + error.message;
    }
}
