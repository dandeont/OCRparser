function istaParser(inputText) {
    const lines = inputText.split('\n');
    console.log('All Lines:', lines);

    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        if (startIndex === -1 && trimmedLine.includes('Fault group')) {
            startIndex = i;
            console.log('Start marker "Fault group" found at line:', i);
        } else if (trimmedLine.includes('18. Service code')) {
            endIndex = i;
            console.log('End marker "18. Service code" found at line:', i);
            break;
        }
    }

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        return 'No faults found between "Fault group" and "18. Service code".';
    }

    const initialKeptLines = lines.slice(startIndex + 1, endIndex).map(line => line.trim());
    console.log('Initial Kept Lines:', initialKeptLines);

    if (initialKeptLines.length === 0) {
        return 'No faults found between "Fault group" and "18. Service code".';
    }

    const processedLines = [];
    for (let i = 0; i < initialKeptLines.length; i++) {
        if (initialKeptLines[i].includes('Service Case report')) {
            i++;
            continue;
        }
        processedLines.push(initialKeptLines[i]);
    }
    console.log('Processed Lines (after removing Service Case report):', processedLines);

    const finalLines = processedLines.filter(line => line !== '');
    console.log('Final Lines (after removing empty lines):', finalLines);

    if (finalLines.length === 0) {
        return 'No faults found after processing.';
    }

    const blocks = [];
    let currentBlock = [];

    for (let i = 0; i < finalLines.length; i++) {
        let line = finalLines[i];
        const isBlockEnd = line.endsWith('-');
        if (isBlockEnd) {
            const elements = line.split(/\s+/);
            elements.shift(); // Remove first element
            elements.pop();   // Remove last element (the '-')
            line = elements.join(' ');
        }
        currentBlock.push(line);
        if (isBlockEnd) {
            blocks.push(currentBlock);
            currentBlock = [];
        }
    }

    console.log('Identified Blocks (pushed when line ends with "-"):', blocks);

    if (blocks.length === 0) {
        return 'No blocks ending with "-" identified in the processed text.';
    }

    const hexRegex = /0x[0-9A-Fa-f]{6}/;

    // Checkpoint 6 output as plain text
    const checkpoint6Blocks = blocks.map(block => {
        if (block.length === 1) {
            return block[0].trim();
        }
        const allButLast = block.slice(0, -1).map(line => line.trim()).join('');
        const lastLine = block[block.length - 1].trim();
        const joinedLine = `${allButLast}   ${lastLine}`;
        if (hexRegex.test(joinedLine)) {
            return joinedLine.replace(hexRegex, '$&   ');
        }
        return joinedLine;
    });
    const checkpoint6Output = checkpoint6Blocks.join('\n');
    console.log('Checkpoint 6 Plain Text Output:', checkpoint6Output);

    // Parse Checkpoint 6 output into desired format
    const parsedLines = checkpoint6Output.split('\n').map(line => {
        // Split by three spaces
        const elements = line.split('   ');
        console.log('Block Elements:', elements);

        // Ensure at least 4 elements, fill with empty strings if needed
        while (elements.length < 4) {
            elements.push('');
        }

        const module = elements[0] || 'UNKNOWN';
        const dtc = elements[1] || 'UNKNOWN';
        const description = elements[2] || 'UNKNOWN';
        let statusMarker = elements[3] || 'Unknown';

        // Map status marker
        switch (statusMarker) {
            case 'No':
                statusMarker = 'History';
                break;
            case 'Yes':
                statusMarker = 'Current';
                break;
            default:
                statusMarker = 'Unknown';
        }

        // Join with three spaces
        return [module, dtc, description, statusMarker].join('   ');
    });

    const formattedOutput = parsedLines.join('\n');
    console.log('Formatted Output (desired format):', formattedOutput);
    return formattedOutput;
}

export { istaParser };