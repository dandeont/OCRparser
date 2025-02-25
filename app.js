document.getElementById('ocrButton').addEventListener('click', processFile);

async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const outputText = document.getElementById('outputText');

    if (fileInput.files.length === 0) {
        alert('Please upload a file.');
        return;
    }

    const file = fileInput.files[0];
    outputText.innerText = 'Processing...';

    try {
        let extractedText = '';

        if (file.type.startsWith('image/')) {
            // Handle image files
            extractedText = await performOCR(file);
        } else if (file.type === 'application/pdf') {
            // Handle PDF files
            extractedText = await processPDF(file);
        } else {
            throw new Error('Unsupported file type.');
        }

        outputText.innerText = extractedText;
    } catch (error) {
        outputText.innerText = 'Error: ' + error.message;
    }
}

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

async function processPDF(pdfFile) {
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
        const text = await performOCR(image);
        extractedText += text + '\n';
    }

    return extractedText;
}
