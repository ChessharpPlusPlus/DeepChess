# ♟️ FEN-Nx Generic Parser (Forsyth-Edwards Notation N-by-N)

This project provides a robust, client-side JavaScript parser that extends the standard Forsyth-Edwards Notation (FEN) to support square chess boards of any size (N x N), which we call **FEN-Nx**.

The standard FEN is strictly defined for the 8x8 chessboard. FEN-Nx maintains the core 6-field structure of FEN but infers the board size (N) dynamically from the piece placement data, allowing it to correctly parse and visualize positions for boards like 10x10, 12x12, or even 8x8.

## ✨ Key Features

* **Generic Board Size (N x N):** Automatically determines the board size (`N`) based on the number of ranks provided.
* **Support for Double-Digit Empty Squares:** Correctly parses empty square counts like `10`, `11`, or `12` in the piece placement string.
* **Client-Side Visualization:** Generates a dynamic HTML chessboard for visual inspection.
* **FEN-Nx Parsing Details:** Outputs a structured JSON object containing all 6 fields and the inferred board size.

## 🚀 How to Use

Simply open the `index.html` file in your browser.

1.  Enter your FEN-Nx string into the input field.
2.  Click **"Parse FEN-Nx"**.
3.  The board visualization and the detailed JSON output will be updated dynamically.

### FEN-Nx Notation Examples

| Size | Piece Placement String | FEN-Nx Example (Initial Position) |
| :--- | :--------------------- | :-------------------------------- |
| **8x8** (Standard FEN) | `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR` | `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` |
| **10x10** | `rnrbqkknbr/pppppppppp/10/10/10/10/10/10/PPPPPPPPPP/RNRBQKRNBR` | `rnrbqkknbr/pppppppppp/10/10/10/10/10/10/PPPPPPPPPP/RNRBQKRNBR w KQkq - 0 1` |
| **12x12** | `pppppppppppp/pppppppppppp/12/12/12/12/12/12/12/12/PPPPPPPPPPPP/PPPPPPPPPPPP` | `pppppppppppp/pppppppppppp/12/12/12/12/12/12/12/12/PPPPPPPPPPPP/PPPPPPPPPPPP w - - 0 1` |

## 🧩 Project Structure

| File Name | Description |
| :--- | :--- |
| `index.html` | The main interface for the parser. It includes the necessary CSS for dynamic board sizing and loads the JavaScript file. |
| `fen-nx-parser.js` | The core JavaScript file containing the `parseFenNx` function, which handles the complex logic for inferring the board size (`N`) and correctly parsing empty square counts (`10`, `12`, etc.) by consuming multiple characters. |
| `README.md` | This file. |

## ⚙️ Technical Implementation Details (FEN-Nx-Parser.js)

The logic for generic board support is concentrated in two key areas:

1.  **Board Size Inference:**
    * The board size `N` is determined by `const N = ranks.length;` (the number of ranks separated by `/`).

2.  **Handling Double-Digit Empty Squares:**
    * The `parsePiecePlacement` function uses a standard index loop (`for (let i = 0; i < rank.length; i++)`) instead of a `for...of` loop.
    * When a digit (`1-9`) is encountered, the parser checks the next character. If the next character is `0-9` (e.g., forming `'10'`), it combines them into a single number (`10`) and manually increments the index (`i++`) to skip the second digit. This ensures that `10` is parsed as 10 empty squares, not as 1 empty square followed by an invalid character (0).