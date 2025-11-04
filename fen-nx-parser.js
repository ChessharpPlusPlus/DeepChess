// FEN (letters) to Unicode symbol mapping
const pieceUnicodeMap = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
};

/**
 * Parses a FEN-Nx string and returns an object
 * with its components and an N x N board array,
 * where N is the inferred board size (e.g., 8 for 8x8, 10 for 10x10).
 * @param {string} fenNxString The FEN-Nx string to be parsed.
 * @returns {object|null} The processed FEN-Nx object or null if invalid.
 */
function parseFenNx(fenNxString) {
    if (typeof fenNxString !== 'string') return null;

    const fields = fenNxString.trim().split(/\s+/);

    if (fields.length !== 6) return null; // Basic validation for 6 fields

    const [
        piecePlacement,
        activeColor,
        castlingAvailability,
        enPassantTarget,
        halfmoveClock,
        fullmoveNumber
    ] = fields;

    let boardSize = 0; // Stores the inferred board size (N)

    /**
     * Converts the piece placement field into an N x N array.
     * Supports single and double-digit empty square counts (e.g., '8', '10', '12').
     * @param {string} pp Piece placement string (e.g., "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
     * @returns {Array<Array<string|null>>|null} N x N array or null if invalid.
     */
    function parsePiecePlacement(pp) {
        const ranks = pp.split('/');
        const N = ranks.length; // N (Board Size) is inferred from the number of ranks
        if (N === 0) return null;
        
        boardSize = N; // Set the board size in the external scope

        const board = [];
        for (const rank of ranks) {
            const rankArray = [];
            let fileCount = 0;

            // Iterate with index to handle double-digit empty square counts (e.g., '10')
            for (let i = 0; i < rank.length; i++) {
                const char = rank[i];

                if (/[1-9]/.test(char)) { // If the character is a digit from 1 to 9 (start of a number)
                    let emptySquaresStr = char;
                    
                    // Check the next character. If it's also a digit, form a compound number
                    if (i + 1 < rank.length && /[0-9]/.test(rank[i + 1])) {
                        emptySquaresStr += rank[i + 1];
                        i++; // ADVANCE the index to skip the second digit (e.g., '0' in '10')
                    }
                    
                    const emptySquares = parseInt(emptySquaresStr, 10);
                    
                    // Validation: must be > 0 and <= N
                    if (emptySquares === 0 || emptySquares > N) return null; 
                    
                    for (let j = 0; j < emptySquares; j++) {
                        rankArray.push(null); 
                    }
                    fileCount += emptySquares;
                
                } else if (/[pnbrqkPNBRQK]/.test(char)) { // If it's a letter (piece)
                    rankArray.push(char);
                    fileCount++;
                } else {
                    return null; // Unexpected character
                }
            }

            if (fileCount !== N) return null; // The rank must have exactly N squares
            board.push(rankArray);
        }
        return board;
    }

    const board = parsePiecePlacement(piecePlacement);
    if (!board) {
        return null; // Piece parsing failed
    }
    
    // Basic additional validations
    if (activeColor !== 'w' && activeColor !== 'b') return null;

    return {
        isValid: true,
        size: boardSize, // New field for the board size
        piecePlacement: piecePlacement,
        board: board,
        activeColor: activeColor,
        castlingAvailability: castlingAvailability,
        enPassantTarget: enPassantTarget,
        halfmoveClock: parseInt(halfmoveClock, 10),
        fullmoveNumber: parseInt(fullmoveNumber, 10),
        fen: fenNxString
    };
}


/**
 * Generates the HTML for the board visualization based on the N x N array.
 * @param {Array<Array<string|null>>} board The N x N array representing the board.
 * @returns {string} The generated HTML.
 */
function generateBoardHtml(board) {
    // Determine board size
    const N = board.length; 
    if (N === 0) return ''; // Empty board case

    const squareColors = {
        light: '#f0d9b5', // Light color
        dark: '#b58863'   // Dark color
    };
    
    // Set board div dynamically (CSS adjustable)
    let boardHtml = `<div class="chessboard size-${N}">`;

    for (let rankIndex = 0; rankIndex < N; rankIndex++) { // Iterate N times
        boardHtml += '<div class="rank">'; 

        for (let fileIndex = 0; fileIndex < N; fileIndex++) { // Iterate N times
            // Determine square color
            const color = (rankIndex + fileIndex) % 2 === 0 ? squareColors.light : squareColors.dark;
            
            const piece = board[rankIndex][fileIndex];
            
            // Determine piece class (for color: white/black)
            const pieceClass = piece ? 'piece ' + (piece === piece.toUpperCase() ? 'white' : 'black') : 'empty';

            // Map FEN character to Unicode symbol
            const pieceSymbol = piece ? pieceUnicodeMap[piece] : ''; 

            boardHtml += `
                <div class="square ${pieceClass}" style="background-color: ${color};">
                    ${pieceSymbol}
                </div>
            `;
        }
        boardHtml += '</div>'; // Close rank div
    }

    boardHtml += '</div>'; // Close chessboard div
    return boardHtml;
}


// --- HTML Integration Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM element references
    const form = document.getElementById('fenForm');
    const input = document.getElementById('fenInput');
    const output = document.getElementById('output');
    const boardContainer = document.getElementById('board-container');
    // New element to display board size
    const sizeOutput = document.getElementById('board-size'); 

    // 2. Add event listener to the form
    form.addEventListener('submit', handleFenSubmit);
    
    // Execute function once on initial load to display the default FEN
    handleFenSubmit({ preventDefault: () => {} }); 

    /**
     * Handles the form submission event.
     * @param {Event} event The event (or a mock for initial load)
     */
    function handleFenSubmit(event) {
        // Intercept form submission to prevent page reload
        if (event.preventDefault) {
             event.preventDefault(); 
        }

        const fenString = input.value;
        const result = parseFenNx(fenString); // Use the new function name

        // Clear previous outputs
        output.classList.remove('error', 'success');
        sizeOutput.textContent = ''; 
        
        if (result && result.isValid) {
            // VALID FEN-NX

            // 1. Display board size
            sizeOutput.textContent = `Board Size: ${result.size}x${result.size}`;

            // 2. Generate and display the board
            const boardHtml = generateBoardHtml(result.board);
            boardContainer.innerHTML = boardHtml;

            // 3. Display parser data (JSON)
            const outputCopy = { ...result };
            delete outputCopy.board; // Remove the large board array from the JSON output for clarity
            const outputText = JSON.stringify(outputCopy, null, 2);
            output.innerHTML = `<pre>${outputText}</pre>`;
            output.classList.add('success');
            
            console.log("FEN-Nx successfully parsed:", result);

        } else {
            // INVALID FEN-NX
            boardContainer.innerHTML = '<p class="error">Could not generate the board. Invalid FEN-Nx.</p>';
            
            let errorMessage = "Error: The FEN-Nx entered is invalid. Check the format, the number of fields (6), and if the piece placement forms a square (N x N).";
            
            if (fenString.trim().split(/\s+/).length !== 6) {
                 errorMessage = "FEN Error: Expected 6 space-separated fields (for standard FEN format).";
            }

            output.textContent = errorMessage;
            output.classList.add('error');
            
            console.error("FEN-Nx parsing error:", fenString);
        }
    }
});