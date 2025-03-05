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

    // Take lines from the first DTC onward, trim each line, and join
    const trimmedLines = lines.slice(startIndex).map(line => line.trimStart());
    console.log('Trimmed Lines:', trimmedLines);
    const resultText = trimmedLines.join('\n');
    console.log('Result Text Before Final Trim:', resultText);
    return resultText.trim();
}

export { consult3Parser };