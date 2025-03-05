import { processFile } from './processors/OCR.js';
console.log('Imported OCR:', processFile);
import { extractTextFromPDF } from './processors/extractPDF.js';
console.log('Imported OCR:', extractTextFromPDF);
import { consult3Parser } from './parsers/consult3Parser.js';
console.log('Imported consult3Parser:', consult3Parser);

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

const ocrButton = document.getElementById('ocrButton');
const extractTextButton = document.getElementById('extractTextButton');
const processButton = document.getElementById('processButton');

const brandSelection = document.getElementById('brandSelection');
const brandDropdown = document.getElementById('brand');

const outputText = document.getElementById('outputText');
const counter = document.getElementById('counter');

let currentFile = null;

// Function to show the drop-down menu and process button
function showBrandSelection() {
    brandSelection.style.display = 'block';
    processButton.style.display = 'block';
}

// Function to update module and DTC counter
function updateCounter(parsedResult) {
    if (!parsedResult || parsedResult === 'No diagnostic trouble codes (DTCs) found.') {
        counter.style.display = 'none';
        counter.innerText = '';
        return;
    }

    const lines = parsedResult.split('\n');
    const moduleCount = lines.filter(line => line.trim().endsWith(':')).length;
    const dtcCount = lines.filter(line => line.trim().length > 0 && !line.trim().endsWith(':')).length;

    counter.innerText = `Module Count: ${moduleCount} | DTC Count: ${dtcCount}`;
    counter.style.display = 'block'; // Show counter when valid
}

// Trigger file input when drop zone is clicked
dropZone.addEventListener('click', () => {
    fileInput.click();
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
        let parsedResult = '';
        // Brand-specific text extraction
        switch (brand) {
            case 'Consult4':
            case 'iHDS':
                extractedText = await processFile(file);
                break;
            case 'FDRS':
            case 'Witech2':
                extractedText = await extractTextFromPDF(file);
                break;
            case 'Consult3':
                extractedText = await extractTextFromPDF(file);
                parsedResult = consult3Parser(extractedText);
                break;
            default:
                throw new Error('Unknown brand selected.');
        }
        outputText.innerText = `Raw Extracted Text:\n${extractedText}\n\nParsed Result:\n${parsedResult}`;
        updateCounter(parsedResult); // Update counter after parsing
    } catch (error) {
        console.error('Error:', error);
        outputText.innerText = 'Error: ' + error.message;
        counter.style.display = 'none'; // Hide counter on error
    }
}

// Handle OCR button click
ocrButton.addEventListener('click', async () => {
    if (currentFile) {
        outputText.innerText = 'Processing...';
        try {
            const extractedText = await processFile(currentFile);
            console.log('OCR Result:', extractedText);
            outputText.innerText = extractedText;
            counter.style.display = 'none'; // Hide counter for raw OCR
        } catch (error) {
            console.error('OCR Error:', error);
            outputText.innerText = 'Error: ' + error.message;
            counter.style.display = 'none';
        }
    } else {
        alert('No file selected. Please upload, drag-and-drop, or paste a file.');
    }
});

// PDF Text Extraction Section
extractTextButton.addEventListener('click', async () => {
    if (currentFile) {
        outputText.innerText = 'Processing...';
        try {
            outputText.innerText = await extractTextFromPDF(currentFile);
            console.log('Extracted Text:', outputText.innerText);
            counter.style.display = 'none'; // Hide counter for raw PDF text
        } catch (error) {
            console.error('Extract Text Error:', error);
            outputText.innerText = 'Error: ' + error.message;
            counter.style.display = 'none';
        }
    } else {
        alert('No file selected. Please upload, drag-and-drop, or paste a file.');
    }
});