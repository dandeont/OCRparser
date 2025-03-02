function consult3Parser(inputText) {
    // Split the input text into lines
    const lines = inputText.split('\n');

    // Find the index of the line containing "TIME"
    const timeIndex = lines.findIndex(line => line.includes('TIME'));

    // Initialize an object to group codes by module
    const groupedData = {};

    // Iterate through the lines after "TIME"
    for (let i = timeIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();

        // Stop parsing if we encounter a line with "No DTC"
        if (line.includes('No DTC')) {
            break;
        }

        // Skip empty lines
        if (!line) continue;

        // Split the line into parts based on spaces
        const parts = line.split(/\s+/);

        // Extract the relevant information
        const partNumber = parts[0];
        const dtc = parts[1];
        const module = parts[2];
        const description = parts.slice(3, -1).join(' ');
        const status = parts[parts.length - 1];

        // Initialize the module in the groupedData object if it doesn't exist
        if (!groupedData[module]) {
            groupedData[module] = [];
        }

        // Add the parsed data to the module's group
        groupedData[module].push({
            code: dtc,
            description,
            status
        });
    }

    return groupedData;
}

// Export the function so it can be used in other files
module.exports = consult3Parser;