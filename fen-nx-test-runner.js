// fen-nx-test-runner.js

// Ensure global functions from fen-nx-parser.js are available (parseFenNx and handleFenSubmit)

(function () {
    const tests = [
        // --- 1. Functional Tests (FEN-Nx) ---
        {
            name: "1. Standard 8x8 initial position",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            expected: { isValid: true, size: 8 }
        },
        {
            name: "2. Standard 8x8 empty board",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            expected: { isValid: true, size: 8 }
        },
        {
            name: "3. 10x10 initial position (Double-digit '10' support)",
            fen: "rnrbqkknbr/pppppppppp/10/10/10/10/10/10/PPPPPPPPPP/RNRBQKRNBR w KQkq - 0 1",
            expected: { isValid: true, size: 10 }
        },
        {
            name: "4. 12x12 simple setup (Double-digit '12' support)",
            fen: "12/pppppppppppp/12/12/12/12/12/12/12/12/PPPPPPPPPPPP/12 w - - 0 1",
            expected: { isValid: true, size: 12 }
        },
        {
            name: "5. 14x14 empty board (Boundary test)",
            fen: "14/14/14/14/14/14/14/14/14/14/14/14/14/14 w - - 0 1",
            expected: { isValid: true, size: 14 }
        },
        {
            name: "6. 6x6 mid-game (Smaller board support)",
            fen: "rnbqkb/pppppp/6/6/PPPPPP/RNBQKB w KQkq - 0 1",
            expected: { isValid: true, size: 6 }
        },
        
        // --- 2. Validation & Boundary Tests ---
        {
            name: "7. Rank must equal inferred size N (8x8 rank with too many files)",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNRR w KQkq - 0 1", // Rank 8 has 9 files
            expected: { isValid: false, size: 8 } 
        },
        {
            name: "8. Rank must equal inferred size N (10x10 rank with too few files - '9')",
            fen: "rnrbqkknbr/pppppppppp/9/10/10/10/10/10/PPPPPPPPPP/RNRBQKRNBR w KQkq - 0 1",
            expected: { isValid: false, size: 10 }
        },
        {
            name: "9. Invalid character in piece placement ('#')",
            fen: "rnbqkbnr/pppppppp/8/#/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            expected: { isValid: false, size: 8 }
        },
        {
            name: "10. Invalid empty square count (0)",
            fen: "rnbqkbnr/pppppppp/08/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            expected: { isValid: false, size: 8 }
        },
        {
            name: "11. Invalid empty square count (Too large: '9' on an 8x8 board)",
            fen: "rnbqkbnr/pppppppp/9/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            expected: { isValid: false, size: 8 }
        },
        
        // --- 3. Field Count Tests (Negative) ---
        {
            name: "12. Too many fields (7 fields)",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 extra",
            expected: { isValid: false }
        },
        {
            name: "13. Too few fields (5 fields)",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0",
            expected: { isValid: false }
        },
        
        // --- 4. Validation of Field 2 (Active Color) ---
        {
            name: "14. Invalid active color ('r')",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR r KQkq - 0 1",
            expected: { isValid: false }
        },
        
        // --- 5. Multiple Digit Handling (Double-digit and mixed) ---
        {
            name: "15. Mixed double and single digits (10x10: P1R8)",
            fen: "P1R8/10/10/10/10/10/10/10/10/10 w - - 0 1",
            expected: { isValid: true, size: 10 }
        },
        {
            name: "16. Mixed double and single digits (12x12: 12 empty)",
            fen: "12/12/12/12/12/12/12/12/12/12/12/12 w - - 0 1",
            expected: { isValid: true, size: 12 }
        },
        {
            name: "17. Invalid multi-digit count (15 on 14x14 board)",
            fen: "15/14/14/14/14/14/14/14/14/14/14/14/14/14 w - - 0 1",
            expected: { isValid: false }
        },
        
        // --- 6. UI / Integration Test Hooks ---
        {
            name: "18. UI Hook Test (Input value is processed correctly)",
            fen: "8/8/8/8/8/8/8/8 w - - 0 1",
            uiCheck: true,
            expected: { jsonOutputContains: `"size": 8`, sizeOutput: 'Board Size: 8x8' }
        },
        {
            name: "19. UI Hook Test (10x10 generates size output)",
            fen: "rnrbqkknbr/pppppppppp/10/10/10/10/10/10/PPPPPPPPPP/RNRBQKRNBR w KQkq - 0 1",
            uiCheck: true,
            expected: { jsonOutputContains: `"size": 10`, sizeOutput: 'Board Size: 10x10' }
        },
        {
            name: "20. UI Hook Test (Invalid FEN shows error message)",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 ERR",
            uiCheck: true,
            expected: { outputClass: 'error', sizeOutput: '' }
        },
        
        // --- 7. Final Sanity Checks (Total 23 Cases) ---
        { name: "21. Complex 8x8 (Middle of game)", fen: "r4rk1/p1ppqppp/1p6/4b3/3P4/2PB4/PP3PPP/R2Q1RK1 b - - 0 16", expected: { isValid: true, size: 8 } },
        { name: "22. Minimum N (4x4 empty board)", fen: "4/4/4/4 w - - 0 1", expected: { isValid: true, size: 4 } },
        { name: "23. Maximum N (14x14 empty board, repeated)", fen: "14/14/14/14/14/14/14/14/14/14/14/14/14/14 w - - 0 1", expected: { isValid: true, size: 14 } },
    ];

    let passedCount = 0;
    let failedCount = 0;

    function runTest(test) {
        let result;
        let success = true;
        let failureReason = "";

        if (test.uiCheck) {
            // Mock UI elements for simple testing
            const mockInput = { value: test.fen };
            const mockOutput = {
                classList: { add: (c) => test._outputClass = c, remove: (c) => {} },
                textContent: '',
                innerHTML: ''
            };
            const mockBoardContainer = { innerHTML: '' };
            const mockSizeOutput = { textContent: '' };

            // Backup original DOM methods to restore later
            const originalGetElementById = document.getElementById;
            
            // Mock document.getElementById to return our mock elements
            document.getElementById = (id) => {
                if (id === 'fenInput') return mockInput;
                if (id === 'output') return mockOutput;
                if (id === 'board-container') return mockBoardContainer;
                if (id === 'board-size') return mockSizeOutput;
                return originalGetElementById(id); // Return original for others
            };

            // Call the global handler function (handleFenSubmit must be accessible from fen-nx-parser.js)
            handleFenSubmit({ preventDefault: () => {} });
            
            // Check UI expectations
            if (test.expected.outputClass && test._outputClass !== test.expected.outputClass) {
                success = false;
                failureReason = `UI Check Failed: Expected class '${test.expected.outputClass}' but got '${test._outputClass}'`;
            }
            if (test.expected.sizeOutput && mockSizeOutput.textContent !== test.expected.sizeOutput) {
                success = false;
                failureReason = `UI Check Failed: Expected size output '${test.expected.sizeOutput}' but got '${mockSizeOutput.textContent}'`;
            }
            if (test.expected.jsonOutputContains && !mockOutput.innerHTML.includes(test.expected.jsonOutputContains)) {
                 success = false;
                 failureReason = `UI Check Failed: Expected JSON output to contain '${test.expected.jsonOutputContains}'`;
            }

            // Restore original document.getElementById
            document.getElementById = originalGetElementById;

        } else {
            // Standard parseFenNx function call
            // parseFenNx must be accessible from fen-nx-parser.js
            result = parseFenNx(test.fen); 
            
            if (test.expected.isValid === false) {
                if (result !== null && result.isValid === true) {
                    success = false;
                    failureReason = `Expected to be INVALID, but parser returned valid.`;
                }
            } else if (test.expected.isValid === true) {
                if (result === null || result.isValid === false) {
                    success = false;
                    failureReason = `Expected to be VALID, but parser returned invalid.`;
                } else if (result.size !== test.expected.size) {
                    success = false;
                    failureReason = `Expected size ${test.expected.size}x${test.expected.size}, but parser returned ${result.size}x${result.size}.`;
                }
            }
        }


        if (success) {
            passedCount++;
            console.log(`✅ Passed: ${test.name}`);
        } else {
            failedCount++;
            console.error(`❌ FAILED: ${test.name}`, failureReason);
        }
    }

    // Run all tests
    console.group("--- FEN-Nx Parser Automated Test Results (23 Cases) ---");
    tests.forEach(runTest);
    console.groupEnd();

    // Final summary
    if (failedCount === 0) {
        console.log(`\n🎉 ALL ${passedCount} TESTS PASSED! FEN-Nx parser is robust.`);
    } else {
        console.error(`\n🚨 TEST FAILURE: ${failedCount} tests failed. Total passed: ${passedCount}.`);
    }

})();