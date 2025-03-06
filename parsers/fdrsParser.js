
function fdrsParser(inputText) {
    const lines = inputText.split('\n');
    console.log('All Lines:', lines);

    // Regex to match DTCs (e.g., C0040   64   28)
    const dtcRegex = /[A-Z][0-9A-F]{4}\s{3}[0-9A-F]{2}\s{3}[0-9A-F]{2}/;

    // Array to store blocks of lines
    const blocks = [];

    // Scan for each DTC match
    let i = 0;
    while (i < lines.length) {
        if (dtcRegex.test(lines[i])) {
            const line0 = lines[i].trim();
            const line0Elements = line0.split(/\s+/);
            const modulePrefix = line0Elements[0]; // First element of line 0 (e.g., "ABS")

            // Find line 1: Next line with the same first element
            let line1Index = -1;
            for (let k = i + 1; k < lines.length; k++) {
                const trimmedLine = lines[k].trim();
                const firstElement = trimmedLine.split(/\s+/)[0];
                if (firstElement === modulePrefix) {
                    line1Index = k;
                    break;
                }
            }

            // Build block if line 1 is found and subsequent lines exist up to line 4
            if (line1Index !== -1 && line1Index + 3 < lines.length) {
                const block = [
                    lines[i].trim(),           // Line 0
                    lines[line1Index].trim(),  // Line 1
                    lines[line1Index + 1].trim(), // Line 2
                    lines[line1Index + 2].trim(), // Line 3
                    lines[line1Index + 3].trim()  // Line 4
                ];
                blocks.push(block);
                console.log('Block found:', block);
                // Move past line 4
                i = line1Index + 4;
            } else {
                console.log('Incomplete block at line', i, 'skipping');
                i++;
            }
        } else {
            i++;
        }
    }

    // If no valid blocks were found, return the no-DTC message
    if (blocks.length === 0) {
        return 'No diagnostic trouble codes (DTCs) found.';
    }

    // Process blocks into desired parsed structure
    const moduleGroups = {};
    blocks.forEach(block => {
        // Line 0: Module name (first element)
        const line0Elements = block[0].split(/\s+/);
        const module = line0Elements[0] || 'UNKNOWN';

        // Line 1: First DTC part (third element in "ABS - C0040 : 64 : 28")
        const line1Elements = block[1].split(/\s+/);
        const dtcPart1 = line1Elements[2] || 'UNKNOWN'; // e.g., "C0040"
        // First description part from line 2
        const descPart1 = block[2].split(' = ')[1] || 'UNKNOWN';

        // Line 2: Second DTC part (fifth element in "ABS - C0040 : 64 : 28")
        const dtcPart2 = line1Elements[4] || 'UNKNOWN'; // e.g., "64"
        // Second description part from line 3
        const descPart2 = block[3].split(' = ')[1] || 'UNKNOWN';

        // Line 3: Status (third element in "ST : 28 = ...")
        const line3Elements = block[3].split(/\s+/);
        const statusCode = line1Elements[6] || 'UNKNOWN'; // Status from line 1 (e.g., "28")
        let status;
        switch (statusCode) {
            case '28':
            case '08':
                status = 'History';
                break;
            case '68':
                status = 'Indeterminate';
                break;
            case '0A':
                status = 'Current';
                break;
            case '2C':
                status = 'Pending';
                break;
            default:
                status = 'Unknown';
        }

        // Join DTC parts
        const dtc = `${dtcPart1}-${dtcPart2}`;
        // Join description parts
        const description = `${descPart1} - ${descPart2}`;

        // Group by module
        if (!moduleGroups[module]) {
            moduleGroups[module] = [];
        }
        moduleGroups[module].push(`${dtc} - ${description} - ${status}`);
    });
    console.log('Module Groups:', moduleGroups);

    // Format into desired parsed structure
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
export { fdrsParser };