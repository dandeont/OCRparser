document.getElementById('ocrButton').addEventListener('click', processFile);

async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const outputText = document.getElementById('outputText');

    if (fileInput.files.length === 0) {
        alert('Please upload a file.');
        return;
    }

    const file = fileInput.files[0];
    console.log('Uploaded File:', file);
    outputText.innerText = 'Processing...';

    try {
        let extractedText = '';

        if (file.type.startsWith('image/')) {
            console.log('Processing image file...');
            extractedText = await performOCR(file);
        } else if (file.type === 'application/pdf') {
            console.log('Processing PDF file...');
            extractedText = await processPDF(file);
        } else {
            throw new Error('Unsupported file type.');
        }

        outputText.innerText = extractedText;
    } catch (error) {
        console.error('Error:', error);
        outputText.innerText = 'Error: ' + error.message;
    }
}

async function performOCR(imageFile) {
    console.log('Starting OCR for image...');
    const worker = await Tesseract.createWorker({
        logger: (m) => console.log(m), // Optional: Log progress
    });

    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    console.log('Recognizing text from image...');
    const { data: { text } } = await worker.recognize(imageFile);
    console.log('Extracted Text:', text);

    await worker.terminate();
    return text;
}

async function processPDF(pdfFile) {
    console.log('Starting PDF processing...');
    const pdfData = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log('Processing page', pageNum);
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

        console.log('Canvas for Page', pageNum, canvas);

        // Convert the canvas to a data URL
        const imageUrl = canvas.toDataURL('image/png');
        console.log('Image URL for Page', pageNum, imageUrl);

        // Create an image element and wait for it to load
        const image = new Image();
        image.src = imageUrl;

        await new Promise((resolve) => {
            image.onload = resolve;
        });

        console.log('Performing OCR on page', pageNum);
        const text = await performOCR(image);
        extractedText += text + '\n';
    }

    console.log('Finished processing PDF.');
    return extractedText;
}
