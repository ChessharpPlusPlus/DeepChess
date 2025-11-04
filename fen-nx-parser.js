// fen-nx-parser.js

// Mapping FEN characters to Unicode symbols
const pieceUnicodeMap = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
};

/**
 * Parses a FEN-Nx string and returns an object with its components, 
 * the inferred board size (N), and the board array.
 * @param {string} fenString The FEN-Nx string to parse.
 * @returns {object|null} Processed FEN object or null if invalid.
 */
function parseFenNx(fenString) {
    if (typeof fenString !== 'string') return null;

    const fields = fenString.trim().split(/\s+/);

    if (fields.length !== 6) return null; // Basic validation for 6 fields

    const [
        piecePlacement,
        activeColor,
        castlingAvailability,
        enPassantTarget,
        halfmoveClock,
        fullmoveNumber
    ] = fields;

    /**
     * Converts the piece placement field into an N x N array, dynamically inferring N.
     * @param {string} pp Piece placement string (e.g., "rnrbqkknbr/pppppppppp/10/.../RNRBQKRNBR")
     * @returns {{board: Array<Array<string|null>>, N: number}|null} Board array and size N, or null if invalid.
     */
    function parsePiecePlacement(pp) {
        const ranks = pp.split('/');
        
        // 1. Board Size Inference (N)
        const N = ranks.length; 
        if (N < 4 || N > 14) return null; // Basic constraint: N must be reasonable (e.g., 4 to 14)

        const board = [];
        for (let r = 0; r < N; r++) { // Loop over ranks
            const rank = ranks[r];
            const rankArray = [];
            let fileCount = 0;
            
            for (let i = 0; i < rank.length; i++) { // Loop using index (i) for lookahead
                const char = rank[i];
                
                if (/[1-9]/.test(char)) { // If it's a digit (empty squares)
                    let emptySquares = parseInt(char, 10);
                    
                    // 2. Logic for double-digit empty squares (e.g., '10', '12')
                    if (/[0-9]/.test(rank[i + 1])) {
                        emptySquares = parseInt(char + rank[i + 1], 10);
                        i++; // Consume the second digit by manually incrementing the loop index
                    }

                    if (emptySquares === 0 || emptySquares > N) return null; // Invalid count (0 or > N)

                    for (let j = 0; j < emptySquares; j++) {
                        rankArray.push(null); 
                    }
                    fileCount += emptySquares;

                } else if (/[pnbrqkPNBRQK]/.test(char)) { // If it's a piece
                    rankArray.push(char);
                    fileCount++;
                } else {
                    return null; // Unexpected character (e.g., '#')
                }
            }

            if (fileCount !== N) return null; // Rank must have exactly N files
            board.push(rankArray);
        }
        
        return { board, N }; 
    }

    const ppResult = parsePiecePlacement(piecePlacement);
    if (!ppResult) return null;

    // Basic validation for active color
    if (activeColor !== 'w' && activeColor !== 'b') return null;

    return {
        isValid: true,
        piecePlacement: piecePlacement,
        board: ppResult.board,
        size: ppResult.N, // The inferred size
        activeColor: activeColor,
        castlingAvailability: castlingAvailability,
        enPassantTarget: enPassantTarget,
        halfmoveClock: parseInt(halfmoveClock, 10),
        fullmoveNumber: parseInt(fullmoveNumber, 10),
        fen: fenString
    };
}


/**
 * Generates the HTML for the board visualization based on the piece array and size N.
 * @param {Array<Array<string|null>>} board The piece array representing the board.
 * @param {number} N The inferred board size (N x N).
 * @returns {string} The generated HTML.
 */
function generateBoardHtml(board, N) {
    const squareColors = {
        light: '#f0d9b5', 
        dark: '#b58863'   
    };
    
    // Uses the inferred size N for the CSS class for dynamic sizing
    let boardHtml = `<div class="chessboard size-${N}">`; 

    for (let rankIndex = 0; rankIndex < N; rankIndex++) {
        boardHtml += '<div class="rank">'; 

        for (let fileIndex = 0; fileIndex < N; fileIndex++) {
            // Determine square color based on coordinates
            const color = (rankIndex + fileIndex) % 2 === 0 ? squareColors.light : squareColors.dark;
            
            const piece = board[rankIndex][fileIndex];
            
            // Determine piece class (white/black)
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


/**
 * Handles the form submission event (made global for testability).
 * @param {Event} event The event (or a mock for initial load)
 * @returns {void}
 */
function handleFenSubmit(event) {
    // Intercept form submission to prevent page reload
    if (event.preventDefault) {
         event.preventDefault(); 
    }

    const input = document.getElementById('fenInput');
    const output = document.getElementById('output');
    const boardContainer = document.getElementById('board-container');
    const sizeOutput = document.getElementById('board-size');

    const fenString = input.value;
    const result = parseFenNx(fenString); // Use the new FEN-Nx parser

    // Clear previous outputs
    output.classList.remove('error', 'success');
    
    if (result && result.isValid) {
        // VALID FEN-Nx

        // 1. Display board size
        sizeOutput.textContent = `Board Size: ${result.size}x${result.size}`;

        // 2. Generate and display board
        const boardHtml = generateBoardHtml(result.board, result.size);
        boardContainer.innerHTML = boardHtml;
        
        // 3. Display parser data (JSON)
        const outputText = JSON.stringify(result, null, 2);
        output.innerHTML = `<pre>${outputText}</pre>`;
        output.classList.add('success');
        
        console.log("FEN-Nx parsed successfully:", result);

    } else {
        // INVALID FEN-Nx
        boardContainer.innerHTML = '<p class="error">Could not generate the board. Invalid FEN-Nx.</p>';
        sizeOutput.textContent = ''; // Clear size display
        
        let errorMessage = "Error: The FEN-Nx entered is invalid. Check the format and the number of fields (6).";
        
        if (fenString.trim().split(/\s+/).length !== 6) {
             errorMessage = "FEN Error: Expected 6 space-separated fields.";
        } else if (result === null) {
            errorMessage = "FEN Error: Piece placement invalid. Check that ranks contain the same number of squares (N) and the number of ranks equals N.";
        }

        output.textContent = errorMessage;
        output.classList.add('error');
        
        console.error("Error parsing FEN-Nx:", fenString);
    }
}


// --- HTML Integration Logic ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM element references
    const form = document.getElementById('fenForm');

    // 2. Add event listener
    form.addEventListener('submit', handleFenSubmit);
    
    // Execute the function once on initial load to display the default FEN
    handleFenSubmit({ preventDefault: () => {} });
});
