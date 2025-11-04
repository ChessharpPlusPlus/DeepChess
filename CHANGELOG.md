# Changelog

All notable changes to the FEN-Nx project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-04 (First Release)

### Added

-   **Core Feature (FEN-Nx):** Introduced the generic FEN parser to support square chess boards of any N x N size.
-   **Parsing Logic:** Implemented dynamic board size inference (N) from the number of ranks.
-   **Boundary Support:** Added custom logic to correctly parse double-digit empty square counts (e.g., '10', '12') in the piece placement string.
-   **Client UI:** Added dynamic CSS rules to scale pieces and the board correctly for different sizes (size-8, size-10, size-12, etc.).
-   **Project Files:** Added standard repository files: `README.md`, `LICENSE` (MIT), and `.gitignore`.
-   **Automated Testing:** Included `fen-nx-test-runner.js` with a suite of 23 unit and integration tests to validate parser logic across all board sizes.
-   **Documentation:** Added `CHANGELOG.md` for release tracking.

### Changed

-   **File Renaming:** Renamed the core logic file from `fen-parser.js` to `fen-nx-parser.js` to reflect the new notation standard.
-   **Function Renaming:** Renamed the main parsing function from `parseFen` to `parseFenNx`.
-   **Code Structure:** Refactored UI handling logic to make `handleFenSubmit` globally accessible for testing purposes.

### Fixed

-   Initial support for 10x10 FEN strings was failing due to improper handling of the '10' empty square count (which was previously being parsed as '1' followed by an invalid '0'). This is now correctly handled.