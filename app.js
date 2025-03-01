const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const ocrButton = document.getElementById('ocrButton');
const outputText = document.getElementById('outputText');
const extractTextButton = document.getElementById('extractTextButton');
const processButton = document.getElementById('processButton');
const brandSelection = document.getElementById('brandSelection');
const brandDropdown = document.getElementById('brand');
//const pdfTextInput = document.getElementById('pdfTextInput');
//const pdfTextResult = document.getElementById('pdfTextResult');

let currentFile = null;

// Function to show the drop-down menu and process button
function showBrandSelection() {
    brandSelection.style.display = 'block'; // Show the drop-down menu
    processButton.style.display = 'block'; // Show the process button
}

// Trigger file input when drop zone is clicked
dropZone.addEventListener('click', () => {
    fileInput.click(); // Simulate a click on the file input
});

// Handle file upload via file input
fileInput.addEventListener('change', (event) => {
    currentFile = event.target.files[0];
    if (currentFile) {
        showBrandSelection();
        outputText.innerText = 'File ready for processing. Select OEM tool and click "Process File".';
    }
    
});

// Handle drag-and-drop
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    currentFile = event.dataTransfer.files[0];
    if (currentFile) {
        showBrandSelection();
        outputText.innerText = 'File ready for processing. Select OEM tool and click "Process File".';
    }
});

// Handle paste
document.addEventListener('paste', (event) => {
    const clipboardData = event.clipboardData || window.clipboardData;
    if (clipboardData.files.length > 0) {
        currentFile = clipboardData.files[0];
        showBrandSelection();
        outputText.innerText = 'File ready for processing. Select OEM tool and click "Process File".';
    }
});

// Process the file based on the selected brand
processButton.addEventListener('click', () => {
    if (currentFile) {
        const selectedBrand = brandDropdown.value;
        assignProcess(currentFile, selectedBrand);
    } else {
        alert('No file selected. Please upload, drag-and-drop, or paste a file.');
    }
});

async function assignProcess(file, brand) {
    outputText.innerText = 'Processing...';

    try {
        let extractedText = '';

        // Brand-specific logic
        switch (brand) {
            case 'Consult4':
            case 'iHDS':
                // For the above tools, always perform OCR
                extractedText = await processFile(file);
                break;
            case 'FDRS':
            case 'Witech2':
            case 'Consult3':
                // For the above tools, extract text directly from PDF (if applicable)
                extractedText = await extractTextFromPDF(file);
                break;
            default:
                throw new Error('Unknown brand selected.');
        }

        // Add brand prefix to the extracted text
        extractedText = `[${brand}] ${extractedText}`;
        outputText.innerText = extractedText;
    } catch (error) {
        console.error('Error:', error);
        outputText.innerText = 'Error: ' + error.message;
    }
}
// Handle OCR button click
ocrButton.addEventListener('click', () => {
    if (currentFile) {
        processFile(currentFile);
    } else {
        alert('No file selected. Please upload, drag-and-drop, or paste a file.');
    }
});

// Process the file (OCR or PDF extraction)
async function processFile(file) {
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

        outputText.innerText = 'OCR Image to text' + '\n' + extractedText;
    } catch (error) {
        console.error('Error:', error);
        outputText.innerText = 'Error: ' + error.message;
    }
    return outputText.innerText;
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
// PDF Text Extraction Section
extractTextButton.addEventListener('click', () => {
    extractTextFromPDF(currentFile);
    
});

// Extract text from PDF
async function extractTextFromPDF(pdfFile) {
    outputText.innerText = 'Processing...';

    try {
        console.log('Loading PDF...');
        const pdfData = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        console.log('PDF loaded. Number of pages:', pdf.numPages);

        let extractedText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            console.log('Processing page', pageNum);
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            console.log('Text content for page', pageNum, textContent);

            const pageText = textContent.items
                .map((item) => item.str)
                .join(' ');

            extractedText += pageText + '\n';
        }

        console.log('Extracted text:', extractedText);
        outputText.innerText = 'PDF text to text' + '\n' + extractedText;
    } catch (error) {
        console.error('Error:', error);
        outputText.innerText = 'Error: ' + error.message;
    }
    return outputText.innerText;
}
