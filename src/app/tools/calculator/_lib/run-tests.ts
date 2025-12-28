
import { evaluateExpression } from './engine';

interface TestCase {
    expr: string;
    expected?: string;
    description: string;
    isError?: boolean;
}

const TEST_CASES: TestCase[] = [
    { description: "Basic Addition", expr: "1 + 1", expected: "2" },
    { description: "Basic Subtraction", expr: "10 - 4", expected: "6" },
    { description: "Multiplication", expr: "7 * 8", expected: "56" },
    { description: "Division", expr: "12 / 4", expected: "3" },
    { description: "Order of Operations", expr: "2 + 3 * 4", expected: "14" },
    { description: "Decimal Precision (Floating Point)", expr: "0.1 + 0.2", expected: "0.3" }, // Should not be 0.30000000000004
    { description: "Scientific Notation Formatting", expr: "10 ^ 20", expected: "1e+20" },
    { description: "Large Number Addition", expr: "9007199254740991 + 2", expected: "9.007199254741e+15" }, // Big Int range
    { description: "Complex Function (Sin)", expr: "sin(0)", expected: "0" },
    { description: "Complex Function (Cos)", expr: "cos(0)", expected: "1" },
    { description: "Square Root", expr: "sqrt(16)", expected: "4" },
    { description: "Percent Logic (Implicit)", expr: "(50) / 100", expected: "0.5" },
    { description: "Division by Zero", expr: "1 / 0", expected: "Infinity" },
    { description: "Precision Check (1/3)", expr: "1/3", expected: "0.33333333333333" }, // 14 digits
];


// --- Helper for Random Generation ---
function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runTests() {
    console.log("Starting Calculator Logic Tests...\n");
    let passed = 0;
    let failed = 0;

    // --- 1. Static Regression Tests ---
    console.log("--- 1. Static Regression Tests ---");
    for (const test of TEST_CASES) {
        try {
            const actual = evaluateExpression(test.expr);
            if (actual === test.expected) {
                console.log(`[PASS] ${test.description}: ${test.expr} => ${actual}`);
                passed++;
            } else {
                console.error(`[FAIL] ${test.description}: ${test.expr}`);
                console.error(`       Expected: ${test.expected}`);
                console.error(`       Actual:   ${actual}`);
                failed++;
            }
        } catch (e: any) {
            if (test.isError) {
                 console.log(`[PASS] ${test.description}: Threw error as expected.`);
                 passed++;
            } else {
                console.error(`[FAIL] ${test.description}: Check threw error: ${e.message}`);
                failed++;
            }
        }
    }

    // --- 2. Random Property-Based Tests (Fuzzing) ---
    console.log("\n--- 2. Random Property Tests (Fuzzing) ---");
    const FUZZ_COUNT = 20;
    
    for (let i = 0; i < FUZZ_COUNT; i++) {
        const a = randomFloat(-10000, 10000);
        const b = randomFloat(-10000, 10000);
        
        // Property 1: Identity (A - A = 0)
        // Note: We format A first to ensure we aren't testing precision loss of the string conversion itself
        try {
            const exprZero = `${a} - ${a}`;
            const resZero = evaluateExpression(exprZero);
            if (resZero === "0") {
                passed++;
            } else {
                console.error(`[FAIL] Identity Property: ${exprZero} => ${resZero} (Expected: 0)`);
                failed++;
            }
            
            // Property 2: Inverse (A + B - B = A)
            // Note: BigNumber should handle this without precision loss usually.
            // However, evaluateExpression(a) formats 'a' to 14 digits.
            // So we compare evaluateExpression(a + b - b) with evaluateExpression(a).
            const exprInverse = `${a} + ${b} - ${b}`;
            const expectedInv = evaluateExpression(`${a}`); 
            const actualInv = evaluateExpression(exprInverse);
            
            if (expectedInv === actualInv) {
                passed++;
            } else {
                 console.error(`[FAIL] Inverse Property: ${exprInverse}`);
                 console.error(`       Expected: ${expectedInv}`);
                 console.error(`       Actual:   ${actualInv}`);
                 failed++;
            }

        } catch (e: any) {
            console.error(`[FAIL] Random Test Crashed: ${e.message}`);
            failed++;
        }
    }
    console.log(`[PASS] Completed ${FUZZ_COUNT * 2} random property checks.`);


    // --- 3. Integer Random Tests (Distributive Property) ---
    console.log("\n--- 3. Integer Random Tests ---");
    for (let i = 0; i < 10; i++) {
        const a = randomInt(-500, 500);
        const b = randomInt(-500, 500);
        const c = randomInt(-500, 500);
        
        // Property: a * (b + c) = a * b + a * c
        try {
            const expr1 = `${a} * (${b} + ${c})`;
            const expr2 = `${a} * ${b} + ${a} * ${c}`;
            
            const res1 = evaluateExpression(expr1);
            const res2 = evaluateExpression(expr2);
            
            if (res1 === res2) {
                passed++;
            } else {
                 console.error(`[FAIL] Distributive Property: ${expr1} (${res1}) != ${expr2} (${res2})`);
                 failed++;
            }
        } catch (e: any) {
             console.error(`[FAIL] Integer Test Crashed: ${e.message}`);
             failed++;
        }
    }
    console.log(`[PASS] Completed 10 integer property checks.`);

    console.log("\n--------------------------------------------------");
    console.log(`Test Summary: ${passed} Passed, ${failed} Failed.`);
    if (failed === 0) {
        console.log("All tests passed! (✅)");
    } else {
        console.error("Some tests failed. (❌)");
        process.exit(1);
    }
}

runTests();
