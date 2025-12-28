
import { create, all, ConfigOptions } from 'mathjs';

const config: ConfigOptions = {
  number: 'BigNumber',
  precision: 64
};

const math = create(all, config);

/**
 * Evaluates a mathematical expression string and formats the result.
 * Matches the logic used in the Calculator UI.
 * 
 * @param expr The mathematical expression to evaluate (e.g. "1 + 2 * 3")
 * @returns The formatted result string (precision 14) or throws an error
 */
export function evaluateExpression(expr: string): string {
    if (!expr) return "";
    
    // Evaluate using mathjs
    const result = math.evaluate(expr);
    
    // Format Result
    // precision: 14 ensures we don't get overly long decimals
    return math.format(result, { precision: 14 });
}
