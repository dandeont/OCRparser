import { processFile } from './processors/OCR.js';
console.log('Imported OCR:', processFile);
import { extractTextFromPDF } from './processors/extractPDF.js';
console.log('Imported OCR:', extractTextFromPDF);

import { consult3Parser } from './parsers/consult3Parser.js';
console.log('Imported consult3Parser:', consult3Parser);

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const ocrButton = document.getElementById('ocrButton');
const outputText = document.getElementById('outputText');
const extractTextButton = document.getElementById('extractTextButton');
const processButton = document.getElementById('processButton');
const brandSelection = document.getElementById('brandSelection');
const brandDropdown = document.getElementById('brand');

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
        let parsedResult = '';

        // Brand-specific text extraction
        switch (brand) {
            case 'Consult4':
            case 'iHDS':
                // For the above tools, always perform OCR
                extractedText = await processFile(file);
                break;
            case 'FDRS':
            case 'Witech2':
                // For the above tools, extract text directly from PDF (if applicable)
                extractedText = await extractTextFromPDF(file);
                break;
            case 'Consult3':
                extractedText = await extractTextFromPDF(file);
                //parsedResult = await consult3Parser(extractedText);
                break; // Exit early since we’re done
            default:
                throw new Error('Unknown brand selected.');
        }

        // Add brand prefix to the extracted text
        //extractedText = `[${brand}] ${extractedText}`;
        //outputText.innerText = extractedText;

        // Brand specific parsing
        switch (brand) {
            case 'Consult3':
                parsedResult = consult3Parser(extractedText);
                console.log('Parsed text:', parsedResult);
            
                break;
            default:
                throw new Error('Unknown brand selected.');
        }

        // Add brand prefix to the extracted text
        
        outputText.innerText = `Raw Extracted Text:\n${extractedText}\n\nParsed Result:\n${parsedResult}`;

    } catch (error) {
        console.error('Error:', error);
        outputText.innerText = 'Error: ' + error.message;
    }
}
// Handle OCR button click
ocrButton.addEventListener('click', () => {
    if (currentFile) {
        outputText.innerText = processFile(currentFile);
    } else {
        alert('No file selected. Please upload, drag-and-drop, or paste a file.');
    }
});


// PDF Text Extraction Section
extractTextButton.addEventListener('click', () => {
    if (currentFile) {
        outputText.innerText = extractTextFromPDF(currentFile);
    } else {
        alert('No file selected. Please upload, drag-and-drop, or paste a file.');
    }
});
