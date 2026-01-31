/**
 * Evaluates a C-style macro expression string.
 * Uses BigInt to simulate integer arithmetic correctly (e.g. integer division).
 */
export const evaluateMacroExpression = (input: string): { decimal: string; hex: string } => {
  if (!input.trim()) {
    throw new Error("Input is empty");
  }

  // 1. Basic Cleaning
  // Remove newlines and excess whitespace, preserving single spaces might help readability but 
  // for tokenizing we just want a clean stream.
  let clean = input.replace(/\s+/g, ' ').trim();

  // 2. Handle C-isms not natively supported by JS BigInt directly in the same syntax
  
  // 2a. Handle the "+ +" (double unary plus or just bad formatting) case from the prompt.
  // JS BigInt doesn't support the unary + operator (e.g., +1n throws error). 
  // We replace patterns like "+ +" with "+" and "+ (" with "(".
  // We iteratively reduce multiple pluses to single pluses if they appear as operators.
  // A safer general approach for the specific prompt case:
  clean = clean.replace(/\+\s*\+/g, '+'); 
  // Remove unary plus at the start of expression or after an opening parenthesis
  clean = clean.replace(/(\(|\^|\||\&|\*|\/|\-|\+)\s*\+/g, '$1'); 
  clean = clean.replace(/^\s*\+/, '');

  // 3. Transform Numbers to BigInt Literals
  // We look for:
  // - Hex: 0x... followed optional U/u
  // - Decimal: digits followed by optional U/u
  // We treat everything as BigInt to ensure integer division rules (truncation) apply.
  
  // Regex Explanation:
  // \b             : Word boundary (start)
  // (              : Start Group 1 (The number part)
  //   0x[0-9a-fA-F]+ : Hex number
  //   |              : OR
  //   \d+            : Decimal number
  // )              : End Group 1
  // [Uu]?          : Optional Unsigned suffix
  // \b             : Word boundary (end)
  const bigIntExpression = clean.replace(/\b(0x[0-9a-fA-F]+|\d+)[Uu]?\b/g, "$1n");

  try {
    // 4. Evaluate using the Function constructor.
    // We create a function that returns the result of the expression.
    // This uses the JS engine's own parser, which now sees BigInt literals.
    // e.g., (32n / 32n) results in 1n. (31n / 32n) results in 0n.
    
    // Security Note: In a real public web app with backend, eval is dangerous. 
    // Since this is a client-side tool for developers, the risk is 'Self-XSS', 
    // but we can add a basic character allowlist check to be safer.
    
    const allowedChars = /^[0-9a-fA-FxXnUu\+\-\*\/\%\(\)\s\|\&\^\>\<\~]+$/;
    // Note: The bigIntExpression will have 'n' suffixes now.
    if (!allowedChars.test(bigIntExpression)) {
       throw new Error("Invalid characters detected. Only math operators and hex/dec numbers allowed.");
    }

    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${bigIntExpression});`)();

    if (typeof result !== 'bigint') {
      throw new Error("Result is not an integer. Check for non-integer division or syntax.");
    }

    // 5. Output Formatting
    // The prompt asks for Unsigned calculation. 
    // BigInts are signed in JS. If the result is negative, it usually means overflow in C logic 
    // or just a negative result.
    // However, the prompt specifically asks to handle 'U' as unsigned. 
    // We will return the raw value. If the user wants 32-bit unsigned wrapping, 
    // we might need to mask, but standard calculator behavior usually shows the true value.
    // Given the example: result 606079872 is positive.
    
    // Hex formatting:
    // If negative, BigInt.toString(16) prints -0x... 
    // For firmware engineers, we often want the Two's Complement representation if it's negative,
    // but without knowing the bit-width (32 vs 64), it's hard to guess. 
    // We will stick to standard representation.
    
    let hexStr = result.toString(16).toUpperCase();
    if (!hexStr.startsWith('-')) {
      hexStr = '0x' + hexStr;
    } else {
      // If negative, format as -0x...
      hexStr = '-0x' + hexStr.substring(1);
    }

    return {
      decimal: result.toString(),
      hex: hexStr
    };

  } catch (err: any) {
    throw new Error(err.message || "Calculation failed");
  }
};
