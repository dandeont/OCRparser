// consult4Parser.js

/**
 * Parses Consult4 diagnostic text and formats DTCs into grouped modules.
 * @param {string} inputText - The raw text extracted from a Consult4 CSV file.
 * @returns {string} - Formatted DTCs grouped by module or a no-DTC message.
 */
function consult4Parser(inputText) {
    // Split the input text into lines
    const lines = inputText.split('\n');
    console.log('All Lines:', lines);

    // Regex to match DTCs (e.g., B2FAC-14, C1711-7B)
    const dtcRegex = /[A-Z][A-Z0-9]{4}-[A-Z0-9]{2}/;

    // Filter lines that contain a valid DTC
    const dtcLines = lines.filter(line => dtcRegex.test(line));
    console.log('DTC Lines:', dtcLines);

    // If no valid DTC lines are found, return the no-DTC message
    if (dtcLines.length === 0) {
        return 'No diagnostic trouble codes (DTCs) found.';
    }

    // Group DTCs by module
    const moduleGroups = {};
    dtcLines.forEach(line => {
        const elements = line.split(',');
        // Ensure we have enough elements, filling with empty strings if needed
        while (elements.length < 8) elements.push('');

        const status = elements[0] || 'UNKNOWN'; // 1st element
        const module = elements[1] || 'UNKNOWN'; // 2nd element
        const dtc = elements[3] || 'UNKNOWN';    // 4th element
        // Handle description based on 5th and 8th elements
        const descriptionPart1 = elements[4] || ''; // 5th element
        const descriptionPart2 = elements[7] || ''; // 8th element
        let description;
        if (descriptionPart1 && descriptionPart2) {
            description = `${descriptionPart1} - ${descriptionPart2}`;
        } else if (descriptionPart1) {
            description = descriptionPart1;
        } else if (descriptionPart2) {
            description = descriptionPart2;
        } else {
            description = 'UNKNOWN';
        }

        if (!moduleGroups[module]) {
            moduleGroups[module] = [];
        }
        moduleGroups[module].push(`${dtc} - ${description} - ${status}`);
    });

    // Format the grouped result
    let formattedResult = '';
    for (const [module, dtcs] of Object.entries(moduleGroups)) {
        formattedResult += `${module}:\n`;
        formattedResult += dtcs.join('\n');
        formattedResult += '\n\n';
    }

    const resultText = formattedResult.trim();
    console.log('Formatted Result:', resultText);
    return resultText;
}

// Export the function
export { consult4Parser };