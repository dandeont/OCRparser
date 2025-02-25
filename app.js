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
document.getElementById('ocrButton').addEventListener('click', processPDF);

async function processPDF() {
    const pdfInput = document.getElementById('pdfInput');
    const outputText = document.getElementById('outputText');

    if (pdfInput.files.length === 0) {
        alert('Please upload a PDF file.');
        return;
    }

    const pdfFile = pdfInput.files[0];
    outputText.innerText = 'Processing...';

    try {
        // Load the PDF file
        const pdfData = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        let extractedText = '';

        // Iterate through each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 });

            // Render the page to a canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;

            // Convert the canvas to an image
            const image = new Image();
            image.src = canvas.toDataURL('image/png');

            // Perform OCR on the image
            const worker = await Tesseract.createWorker({
                logger: (m) => console.log(m), // Optional: Log progress
            });

            await worker.loadLanguage('eng');
            await worker.initialize('eng');

            const { data: { text } } = await worker.recognize(image);
            extractedText += text + '\n';

            await worker.terminate();
        }

        outputText.innerText = extractedText;
    } catch (error) {
        outputText.innerText = 'Error: ' + error.message;
    }
}
