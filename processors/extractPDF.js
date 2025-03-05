// Extract text from PDF
async function extractTextFromPDF(pdfFile) {
    let returnText = ' ';
    returnText = 'Processing...';

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

            // Reconstruct text with spacing and line breaks
            let pageText = '';
            let lastY = 0;

            textContent.items.forEach((item) => {
                const { str, transform } = item;

                // Extract the y-coordinate of the text item
                const y = transform[5];

                // Add a newline if the y-coordinate changes significantly
                if (Math.abs(y - lastY) > 10) {
                    pageText += '\n';
                }

                // Add the text to the page
                pageText += str + ' ';
                lastY = y;
            });

            extractedText += pageText + '\n';
        }

        console.log('Extracted text:', extractedText);
        returnText = 'PDF text to text' + '\n' + extractedText;
    } catch (error) {
        console.error('Error:', error);
        returnText = 'Error: ' + error.message;
    }

    return returnText.trim();
}

export { extractTextFromPDF };