async function extractCSV(file) {
    return new Promise((resolve, reject) => {
        if (!file || file.type !== 'text/csv') {
            reject(new Error('Invalid file type. Please provide a CSV file.'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const csvText = event.target.result;
            // Split into lines (rows)
            const lines = csvText.split('\n');
            // Process each line into an array of columns, removing double quotes
            const csvArray = lines.map(line => {
                // Split by comma, trim whitespace, and remove double quotes
                return line.split(',').map(value => value.trim().replace(/"/g, ''));
            });
            // Remove any empty rows
            const filteredArray = csvArray.filter(row => row.some(value => value.length > 0));
            // Convert array back to text with commas and newlines
            const formattedText = filteredArray.map(row => row.join(',')).join('\n');
            resolve(formattedText);
        };

        reader.onerror = () => {
            reject(new Error('Error reading CSV file.'));
        };

        reader.readAsText(file);
    });
}

export { extractCSV };