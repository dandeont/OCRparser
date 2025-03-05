function consult3Parser(inputText) {
    // Split the input text into lines
    const lines = inputText.split('\n');
    console.log('All Lines:', lines);

    // Find the index of the first line containing a DTC
    const startIndex = lines.findIndex(line => line.match(/[A-Z][A-Z0-9]{4}-[A-Z0-9]{2}/));
    console.log('Start Index:', startIndex);
    console.log('First DTC Line:', startIndex !== -1 ? lines[startIndex] : 'None');
    
    // If no DTC is found, return the no-DTC message
    if (startIndex === -1) {
        return 'No diagnostic trouble codes (DTCs) found.';
    }

    // Take lines from the first DTC onward, fully trim each line, and stop at first "No DTC"
    const trimmedLines = [];
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('No DTC')) {
            break;
        }
        trimmedLines.push(line);
    }
    console.log('Trimmed Lines:', trimmedLines);

    // Define status words in uppercase
    const possibleStatuses = ['PAST', 'CURRENT', '1T', 'PENDING'];

    // Process trimmedLines to join lines not ending with status words
    const processedLines = [];
    let i = 0;
    while (i < trimmedLines.length) {
        let currentLine = trimmedLines[i];
        const parts = currentLine.split(/\s+/);
        const lastWord = parts[parts.length - 1];
        const endsWithStatus = possibleStatuses.includes(lastWord.toUpperCase());

        if (!endsWithStatus && i + 1 < trimmedLines.length) {
            const nextLine = trimmedLines[i + 1];
            currentLine += ' ' + nextLine;
            i++;
        }
        processedLines.push(currentLine);
        i++;
    }
    console.log('Processed Lines:', processedLines);

    // Remove part number and spaces before DTC, then ensure three spaces after DTC and module
    const formattedLines = processedLines.map(line => {
        const firstDtcMatch = line.match(/^[^\s]+\s+([A-Z][A-Z0-9]{4}-[A-Z0-9]{2})/);
        if (!firstDtcMatch) return line;
        const dtcStartIndex = firstDtcMatch.index + firstDtcMatch[0].indexOf(firstDtcMatch[1]);
        const dtc = firstDtcMatch[1];
        const restOfLine = line.substring(dtcStartIndex + dtc.length).trimStart();
        const restSections = restOfLine.split(/\s{3,}/);
        const module = restSections[0];
        const descriptionAndStatus = restSections.slice(1).join('   ');
        return `${dtc}   ${module}   ${descriptionAndStatus}`;
    });
    console.log('Formatted Lines:', formattedLines);

    // Group by module using three-space separators, no indentation
    const moduleGroups = {};
    for (const line of formattedLines) {
        const sections = line.split(/\s{3,}/);
        if (sections.length < 3) continue;

        const dtc = sections[0];
        const module = sections[1];
        const descriptionWithStatus = sections.slice(2).join(' ');
        
        const descParts = descriptionWithStatus.split(/\s+/);
        const status = possibleStatuses.includes(descParts[descParts.length - 1].toUpperCase())
            ? descParts.pop()
            : 'UNKNOWN';
        const description = descParts.join(' ');

        if (!moduleGroups[module]) {
            moduleGroups[module] = [];
        }
        moduleGroups[module].push(`${dtc} - ${description} - ${status}`);
    }

    // Format into grouped modules without indentation
    let groupedResult = '';
    for (const [module, dtcs] of Object.entries(moduleGroups)) {
        groupedResult += `${module}:\n`;
        groupedResult += dtcs.map(dtc => `${dtc}`).join('\n'); // No leading spaces
        groupedResult += '\n\n';
    }

    const resultText = groupedResult.trim();
    console.log('Result Text Before Final Trim:', resultText);
    return resultText.trim();
}

// Export using ES Module syntax
export { consult3Parser };