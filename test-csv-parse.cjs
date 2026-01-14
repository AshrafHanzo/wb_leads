const fs = require('fs');

const text = fs.readFileSync('test-sheet.csv', 'utf8');
console.log('File length:', text.length, 'chars');

let rows = [];
let currentRow = [];
let currentValue = '';
let inQuotes = false;

for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
        if (char === '"') {
            if (nextChar === '"') {
                currentValue += '"';
                i++;
            } else {
                inQuotes = false;
            }
        } else {
            currentValue += char;
        }
    } else {
        if (char === '"') {
            inQuotes = true;
        } else if (char === ',') {
            currentRow.push(currentValue.trim());
            currentValue = '';
        } else if (char === '\r' && nextChar === '\n') {
            currentRow.push(currentValue.trim());
            rows.push(currentRow);
            currentRow = [];
            currentValue = '';
            i++;
        } else if (char === '\n') {
            currentRow.push(currentValue.trim());
            rows.push(currentRow);
            currentRow = [];
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
}

if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
}

console.log('Total rows:', rows.length);
console.log('Headers:', rows[0]);
console.log('First data row:', rows[1]);

// Find rows with Phone 2 (column index 10)
const rowsWithPhone2 = rows.filter((r, i) => i > 0 && r[10] && r[10].trim().length > 0);
console.log('Rows with Phone 2:', rowsWithPhone2.length);
if (rowsWithPhone2.length > 0) {
    console.log('Example row with Phone 2:', rowsWithPhone2[0]);
}
