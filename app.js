function encrypt() {
    const text = document.getElementById('text').value;
    const key = document.getElementById('key').value;
    const cipher = document.getElementById('cipher').value;
  
    // Validate the key for the selected cipher
    const validationMessage = validateKey(key, cipher);
    if (validationMessage) {
      document.getElementById('output').value = validationMessage;
      return;
    }
  
    let encryptedText = '';
    
    switch (cipher) {
      case 'caesar':
        encryptedText = caesarCipher(text, parseInt(key));
        break;
      case 'monoalphabetic':
        encryptedText = monoalphabeticCipher(text, key);
        break;
      case 'playfair':
        encryptedText = playfairCipher(text, key, 'encrypt');
        break;
      case 'hill':
        encryptedText = hillCipherEncrypt(text, key);
        break;
      case 'vigenere':
        encryptedText = vigenereCipher(text, key, 'encrypt');
        break;
      case 'railfence':
        encryptedText = railFenceCipher(text, parseInt(key), 'encrypt');
        break;
      case 'columnar':
        encryptedText = columnarTransposition(text, key, 'encrypt');
        break;
      case 'double_columnar':
        encryptedText = doubleColumnarTransposition(text, key, 'encrypt');
        break;
      default:
        encryptedText = 'Invalid Cipher';
    }
  
    document.getElementById('output').value = encryptedText;
  }
  
  function decrypt() {
    const text = document.getElementById('text').value;
    const key = document.getElementById('key').value;
    const cipher = document.getElementById('cipher').value;
  
    // Validate the key for the selected cipher
    const validationMessage = validateKey(key, cipher);
    if (validationMessage) {
      document.getElementById('output').value = validationMessage;
      return;
    }
  
    let decryptedText = '';
    
    switch (cipher) {
      case 'caesar':
        decryptedText = caesarCipher(text, -parseInt(key));
        break;
      case 'monoalphabetic':
        decryptedText = monoalphabeticCipher(text, key, true);
        break;
      case 'playfair':
        decryptedText = playfairCipher(text, key, 'decrypt');
        break;
      case 'hill':
        decryptedText = hillCipherDecrypt(text, key);
        break;
      case 'vigenere':
        decryptedText = vigenereCipher(text, key, 'decrypt');
        break;
      case 'railfence':
        decryptedText = railFenceCipher(text, parseInt(key), 'decrypt');
        break;
      case 'columnar':
        decryptedText = columnarTransposition(text, key, 'decrypt');
        break;
      case 'double_columnar':
        decryptedText = doubleColumnarTransposition(text, key, 'decrypt');
        break;
      default:
        decryptedText = 'Invalid Cipher';
    }
  
    document.getElementById('output').value = decryptedText;
  }
  
  function validateKey(key, cipher) {
    switch (cipher) {
      case 'caesar':
        if (!/^\d+$/.test(key)) {
          return 'Caesar Cipher: Key must be a number';
        }
        break;
      case 'monoalphabetic':
        if (!/^[A-Za-z]+$/.test(key) || key.length !== 26) {
          return 'Monoalphabetic Cipher: Key must be a 26-letter alphabet string (A-Z)';
        }
        break;
      case 'playfair':
        if (!/^[A-Za-z]+$/.test(key) || key.length < 1) {
          return 'Playfair Cipher: Key must be a string of letters (no numbers or symbols)';
        }
        break;
      case 'hill':
        if (!/^[A-Za-z]+$/.test(key) || Math.sqrt(key.length) % 1 !== 0) {
          return 'Hill Cipher: Key must be a square matrix (length should be a perfect square)';
        }
        break;
      case 'vigenere':
        if (!/^[A-Za-z]+$/.test(key)) {
          return 'Vigenère Cipher: Key must be a string of letters (no numbers or symbols)';
        }
        break;
      case 'railfence':
        if (!/^\d+$/.test(key) || parseInt(key) < 2) {
          return 'Rail Fence Cipher: Key must be a number greater than 1';
        }
        break;
      case 'columnar':
      case 'double_columnar':
        if (!/^[0-9]+$/.test(key) || key.length < 1) {
          return 'Columnar Transposition: Key must be a string of digits (e.g., "3142")';
        }
        break;
      default:
        return 'Invalid Cipher';
    }
    return null; // No error
  }
  
  // Caesar Cipher
  function caesarCipher(text, shift) {
    return text.split('').map(char => {
      if (!/[a-zA-Z]/.test(char)) return char;
      const code = char.charCodeAt(0);
      const base = char.toLowerCase() === char ? 97 : 65;
      return String.fromCharCode(((code - base + shift + 26) % 26) + base);
    }).join('');
  }
  
  // Monoalphabetic Cipher
  function monoalphabeticCipher(text, key, decrypt = false) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    key = key.toUpperCase().split('');
    const cipherKey = decrypt ? key.reverse() : key;
    let mapping = {};
  
    for (let i = 0; i < 26; i++) {
      mapping[alphabet[i]] = cipherKey[i];
    }
  
    return text.split('').map(char => {
      if (!/[a-zA-Z]/.test(char)) return char;
      const upperChar = char.toUpperCase();
      return mapping[upperChar].toLowerCase() === upperChar 
             ? mapping[upperChar] 
             : mapping[upperChar].toLowerCase();
    }).join('');
  }
  
  // Playfair Cipher
  function playfairCipher(text, key, mode) {
    key = key.toUpperCase().replace(/[^A-Z]/g, '').split('');
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 'J' is omitted
    let matrix = [];
    let seen = new Set();
    let result = '';
  
    // Step 1: Remove duplicates from the key
    for (let char of key) {
      if (!seen.has(char)) {
        seen.add(char);
        matrix.push(char);
      }
    }
  
    // Step 2: Fill the matrix with remaining letters from the alphabet
    for (let char of alphabet) {
      if (!seen.has(char)) {
        seen.add(char);
        matrix.push(char);
      }
    }
  
    // Step 3: Create digraphs (pairs of letters)
    function createDigraphs(text) {
      text = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I'); // Normalize text
      const digraphs = [];
      for (let i = 0; i < text.length; i += 2) {
        let first = text[i];
        let second = text[i + 1] || 'X'; // If the second letter is missing, add 'X'
        if (first === second) {
          second = 'X'; // If both letters are the same, insert 'X' as separator
          i--; // Reprocess the first letter
        }
        digraphs.push([first, second]);
      }
      return digraphs;
    }
  
    const digraphs = createDigraphs(text);
    
    // Step 4: Find the position of each letter in the 5x5 matrix
    function findPosition(letter) {
      const idx = matrix.indexOf(letter);
      return [Math.floor(idx / 5), idx % 5];
    }
  
    // Step 5: Encrypt/Decrypt each digraph
    function processDigraph(pair) {
      const [first, second] = pair;
      const [row1, col1] = findPosition(first);
      const [row2, col2] = findPosition(second);
  
      if (row1 === row2) {
        // Same row: Shift columns
        return [matrix[row1 * 5 + (col1 + (mode === 'encrypt' ? 1 : -1) + 5) % 5],
                matrix[row2 * 5 + (col2 + (mode === 'encrypt' ? 1 : -1) + 5) % 5]];
      } else if (col1 === col2) {
        // Same column: Shift rows
        return [matrix[((row1 + (mode === 'encrypt' ? 1 : -1)) + 5) % 5 * 5 + col1],
                matrix[((row2 + (mode === 'encrypt' ? 1 : -1)) + 5) % 5 * 5 + col2]];
      } else {
        // Rectangle: Swap columns
        return [matrix[row1 * 5 + col2], matrix[row2 * 5 + col1]];
      }
    }
  
    // Process all digraphs and build the result
    for (let pair of digraphs) {
      const [first, second] = processDigraph(pair);
      result += first + second;
    }
  
    return result;
  }
  
  // Hill Cipher
  function hillCipher(text, key, mode) {
    // Step 1: Check if the key length is a perfect square
    const matrixSize = Math.sqrt(key.length);
    if (matrixSize % 1 !== 0) {
      return 'Hill Cipher: Key length must be a perfect square';
    }
  
    // Step 2: Convert the key (string) to a matrix of numbers (A=0, B=1, ..., Z=25)
    const keyArray = key.toUpperCase().split('').map(char => {
      if (char >= 'A' && char <= 'Z') {
        return char.charCodeAt(0) - 65; // Convert 'A' to 0, 'B' to 1, ..., 'Z' to 25
      }
      return null; // This will catch invalid characters
    }).filter(num => num !== null); // Filter out any invalid characters (e.g., non-alphabetic)
  
    if (keyArray.length !== key.length) {
      return 'Hill Cipher: Key contains invalid characters (only letters are allowed)';
    }
  
    // Step 3: Create the matrix for the key (2x2, 3x3, etc.)
    const matrix = [];
    for (let i = 0; i < matrixSize; i++) {
      matrix.push(keyArray.slice(i * matrixSize, (i + 1) * matrixSize));
    }
  
    // Step 4: Function to convert text to numerical values
    function textToNumbers(text) {
      return text.toUpperCase().split('').map(char => {
        if (char >= 'A' && char <= 'Z') {
          return char.charCodeAt(0) - 65; // Convert 'A' to 0, 'B' to 1, ..., 'Z' to 25
        }
        return -1; // Invalid characters (e.g., spaces or punctuation)
      }).filter(num => num !== -1); // Remove invalid characters
    }
  
    // Step 5: Function to convert numbers back to letters
    function numbersToText(numbers) {
      return numbers.map(num => String.fromCharCode(num + 65)).join('');
    }
  
    // Step 6: Encrypt or Decrypt the text based on the mode
    const numText = textToNumbers(text);
    const result = [];
  
    // Process the text in blocks
    for (let i = 0; i < numText.length; i += matrixSize) {
      const block = numText.slice(i, i + matrixSize); // Take a block of size matrixSize
      const newBlock = Array(matrixSize).fill(0);
  
      // Encrypt or decrypt based on matrix multiplication
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          newBlock[r] += matrix[r][c] * block[c];
        }
        newBlock[r] = newBlock[r] % 26; // Ensure the result stays within A-Z range
      }
  
      result.push(...newBlock); // Add the result to the output
    }
  
    return numbersToText(result); // Convert the result numbers back to text
  }

// Function to calculate the greatest common divisor (gcd) of two numbers
function gcd(a, b) {
  while (b !== 0) {
      let temp = b;
      b = a % b;
      a = temp;
  }
  return a;
}

// Function to calculate modular inverse of a number modulo 26 using Extended Euclidean Algorithm
function modInverse(a, m) {
  a = a % m;
  let t = 0;
  let newT = 1;
  let r = m;
  let newR = a;

  while (newR !== 0) {
      let quotient = Math.floor(r / newR);
      let tempT = t;
      t = newT;
      newT = tempT - quotient * newT;

      let tempR = r;
      r = newR;
      newR = tempR - quotient * newR;
  }

  if (r > 1) {
      return -1; // No inverse exists
  }
  if (t < 0) {
      t = t + m; // Make sure inverse is positive
  }
  return t;
}

// Function to calculate the determinant of a 2x2 matrix modulo 26
function determinant(matrix) {
  return (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]) % 26;
}

// Function to find the inverse of a 2x2 matrix modulo 26
function matrixInverse(matrix) {
  // Calculate the determinant of the matrix
  const det = determinant(matrix);

  // Check if the determinant is coprime with 26 (i.e., gcd(det, 26) == 1)
  if (gcd(det, 26) !== 1) {
      console.error("No inverse matrix exists because the determinant is not coprime with 26.");
      return null;
  }

  // Calculate the modular inverse of the determinant modulo 26
  const invDet = modInverse(det, 26);

  if (invDet === -1) {
      console.error("No modular inverse of the determinant exists.");
      return null;
  }

  // Inverse matrix formula for a 2x2 matrix:
  // invMatrix = (1 / det) * [k4  -k2; -k3  k1] % 26
  const invMatrix = [
      [(matrix[1][1] * invDet) % 26, (-matrix[0][1] * invDet) % 26],
      [(-matrix[1][0] * invDet) % 26, (matrix[0][0] * invDet) % 26]
  ];

  // Ensure all values are positive and between 0 and 25
  return invMatrix.map(row => row.map(val => (val + 26) % 26));
}


// Hill Cipher Encryption
function hillCipherEncrypt(text, key) {
  // Prepare the key matrix (assuming key is a 4-character string for 2x2 matrix)
  const matrix = [
      [key.charCodeAt(0) - 97, key.charCodeAt(1) - 97],
      [key.charCodeAt(2) - 97, key.charCodeAt(3) - 97]
  ];

  // Prepare the text: convert it to a numerical array
  let textArray = [];
  for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') {
          textArray.push(text[i].toLowerCase().charCodeAt(0) - 97); // Convert to A=0, B=1, ..., Z=25
      }
  }

  // Ensure the length of text is even (for 2x2 Hill Cipher)
  if (textArray.length % 2 !== 0) {
      textArray.push('x'.charCodeAt(0) - 97); // Add 'x' if odd length
  }

  // Encryption: Matrix multiplication modulo 26
  let encryptedText = '';
  for (let i = 0; i < textArray.length; i += 2) {
      const vector = [textArray[i], textArray[i + 1]];

      const encryptedVector = [
          (matrix[0][0] * vector[0] + matrix[0][1] * vector[1]) % 26,
          (matrix[1][0] * vector[0] + matrix[1][1] * vector[1]) % 26
      ];

      encryptedText += String.fromCharCode(encryptedVector[0] + 97) + String.fromCharCode(encryptedVector[1] + 97);
  }

  return encryptedText;
}

// Hill Cipher Decryption
function hillCipherDecrypt(text, key) {
  // Prepare the key matrix (assuming key is a 4-character string for 2x2 matrix)
  const matrix = [
      [key.charCodeAt(0) - 97, key.charCodeAt(1) - 97],
      [key.charCodeAt(2) - 97, key.charCodeAt(3) - 97]
  ];

  // Get the inverse of the key matrix
  const inverseMatrix = matrixInverse(matrix);
  if (!inverseMatrix) {
      console.error("No inverse matrix found for this key");
      alert("No inverse matrix found for this key")
      return '';
  }

  // Prepare the text: convert it to a numerical array
  let textArray = [];
  for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') {
          textArray.push(text[i].toLowerCase().charCodeAt(0) - 97); // Convert to A=0, B=1, ..., Z=25
      }
  }

  // Decryption: Matrix multiplication with the inverse matrix modulo 26
  let decryptedText = '';
  for (let i = 0; i < textArray.length; i += 2) {
      const vector = [textArray[i], textArray[i + 1]];

      const decryptedVector = [
          (inverseMatrix[0][0] * vector[0] + inverseMatrix[0][1] * vector[1]) % 26,
          (inverseMatrix[1][0] * vector[0] + inverseMatrix[1][1] * vector[1]) % 26
      ];

      decryptedText += String.fromCharCode(decryptedVector[0] + 97) + String.fromCharCode(decryptedVector[1] + 97);
  }

  return decryptedText;
}

  
  
  // Vigenère Cipher
  function vigenereCipher(text, key, mode) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    let keyIndex = 0;
  
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      if (!alphabet.includes(char)) {
        result += text[i];
        continue;
      }
  
      const shift = alphabet.indexOf(key[keyIndex % key.length].toUpperCase());
      const shiftAmount = mode === 'encrypt' ? shift : -shift;
      const charIndex = alphabet.indexOf(char);
      const newCharIndex = (charIndex + shiftAmount + 26) % 26;
      result += alphabet[newCharIndex];
  
      keyIndex++;
    }
  
    return result;
  }
  
  // Rail Fence Cipher
  function railFenceCipher(text, key, mode) {
    const rails = Array.from({ length: key }, () => []); // Initialize empty rails
    let result = '';
  
    // Encryption: Place the text in rails following the zigzag pattern
    if (mode === 'encrypt') {
      let row = 0;
      let down = true; // Direction to move
  
      // Loop through each character and add it to the appropriate rail
      for (let i = 0; i < text.length; i++) {
        rails[row].push(text[i]);
  
        // Change direction when we reach top or bottom rail
        if (row === 0) down = true;
        if (row === key - 1) down = false;
  
        // Move up or down
        row += down ? 1 : -1;
      }
  
      // Join all rails together to form the encrypted text
      for (let i = 0; i < key; i++) {
        result += rails[i].join('');
      }
    }
    // Decryption: Reconstruct the zigzag pattern and extract characters in the correct order
    else {
      const railLengths = Array(key).fill(0);
      let row = 0;
      let down = true;
  
      // Step 1: Calculate the number of characters in each rail
      for (let i = 0; i < text.length; i++) {
        railLengths[row]++;
        if (row === 0) down = true;
        if (row === key - 1) down = false;
        row += down ? 1 : -1;
      }
  
      // Step 2: Fill the rails with the characters from the encrypted text
      let index = 0;
      for (let i = 0; i < key; i++) {
        rails[i] = text.slice(index, index + railLengths[i]).split('');
        index += railLengths[i]; // Move the index by the length of the rail
      }
  
      // Step 3: Reconstruct the original message by following the zigzag pattern
      row = 0;
      down = true;
  
      for (let i = 0; i < text.length; i++) {
        result += rails[row].shift(); // Extract the character from the rail
        if (row === 0) down = true;
        if (row === key - 1) down = false;
        row += down ? 1 : -1;
      }
    }
  
    return result;
  }
  
  
  
  // Columnar Transposition
  function columnarTransposition(text, key, mode) {
    // Encrypt or decrypt using columnar transposition method
    return mode === 'encrypt' ? columnarEncrypt(text, key) : columnarDecrypt(text, key);
  }
  
  // Columnar Transposition Encryption
  // Columnar Transposition Encryption
// Columnar Transposition Encryption
function columnarEncrypt(text, key) {
  const columns = key.length;
  const rows = Math.ceil(text.length / columns);  // Calculate number of rows needed
  const paddedText = text + ' '.repeat(rows * columns - text.length); // Pad the text with spaces
  const grid = [];

  // Create the grid by filling each row with the padded text
  for (let i = 0; i < rows; i++) {
    grid.push(paddedText.slice(i * columns, (i + 1) * columns));
  }

  let result = '';

  // Sort the key and determine the column order based on the sorted positions
  const sortedKeyIndexes = Array.from(key).map((char, index) => ({ char, index }))
                                       .sort((a, b) => a.char - b.char)
                                       .map(item => item.index);

  // Read the grid column by column based on the sorted key positions
  for (let i = 0; i < columns; i++) {
    const columnIndex = sortedKeyIndexes[i];
    for (let j = 0; j < rows; j++) {
      result += grid[j][columnIndex];
    }
  }

  return result;
}


  
  // Columnar Transposition Decryption
  // Columnar Transposition Decryption
function columnarDecrypt(text, key) {
  const columns = key.length;
  const rows = Math.ceil(text.length / columns);
  const grid = Array.from({ length: rows }, () => Array(columns).fill(''));

  let index = 0;

  // Sort the key and determine the column order based on the sorted positions
  const sortedKeyIndexes = Array.from(key).map((char, index) => ({ char, index }))
                                       .sort((a, b) => a.char - b.char)
                                       .map(item => item.index);

  // Fill the grid with the characters from the encrypted text based on the sorted key
  for (let i = 0; i < columns; i++) {
    const columnIndex = sortedKeyIndexes[i];
    for (let j = 0; j < rows; j++) {
      grid[j][columnIndex] = text[index++];
    }
  }

  // Read the grid row by row to reconstruct the original message
  let result = '';
  for (let i = 0; i < rows; i++) {
    result += grid[i].join('');
  }

  return result.trim(); // Remove trailing spaces
}

  
  // Double Columnar Transposition
  function doubleColumnarTransposition(text, key, mode) {
    // Perform double columnar transposition (encrypt/decrypt)
    return mode === 'encrypt' ? doubleColumnarEncrypt(text, key) : doubleColumnarDecrypt(text, key);
  }
  
  // Double Columnar Transposition Encryption
  function doubleColumnarEncrypt(text, key) {
    const firstPass = columnarEncrypt(text, key);
    return columnarEncrypt(firstPass, key); // Apply columnar encryption twice
  }
  
  // Double Columnar Transposition Decryption
  function doubleColumnarDecrypt(text, key) {
    const firstPass = columnarDecrypt(text, key);
    return columnarDecrypt(firstPass, key); // Apply columnar decryption twice
  }
  