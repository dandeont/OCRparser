// Process the file (OCR or PDF extraction)
async function processFile(file) {
    outputText.innerText = 'Processing...';

    try {
        let extractedText = '';
        let returnText = '';

        if (file.type.startsWith('image/')) {
            console.log('Processing image file...');
            extractedText = await performOCR(file);
        } else if (file.type === 'application/pdf') {
            console.log('Processing PDF file...');
            extractedText = await processPDF(file);
        } else {
            throw new Error('Unsupported file type.');
        }

        returnText = 'OCR Image to text' + '\n' + extractedText;
    } catch (error) {
        console.error('Error:', error);
        returnText = 'Error: ' + error.message;
    }
    return returnText;
}

// Perform OCR on an image
async function performOCR(imageFile) {
    const worker = await Tesseract.createWorker({
        logger: (m) => console.log(m), // Optional: Log progress
    });

    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();

    return text;
}

// Set the worker source for PDF.js

// Process a PDF file
async function processPDF(pdfFile) {
    const pdfData = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport,
        }).promise;

        // Convert the canvas to a data URL
        const imageUrl = canvas.toDataURL('image/png');

        // Create an image element and wait for it to load
        const image = new Image();
        image.src = imageUrl;

        await new Promise((resolve) => {
            image.onload = resolve;
        });

        // Perform OCR on the image
        const text = await performOCR(image);
        extractedText += 'Image to text: ' + text + '\n';
    }

    return extractedText;
}

export { processFile };