// Write a function that returns the Fibonacci sequence up to n
// GitHub Copilot suggestion (simulated):
function fibonacciSequence(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];
    
    const sequence = [0, 1];
    for (let i = 2; i < n; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
}

// Customized version - added function name change and print statement
function generateFibonacci(limit) {
    const result = fibonacciSequence(limit);
    console.log(`Fibonacci sequence up to ${limit} numbers:`, result);
    return result;
}

// Test the function
const fibNumbers = generateFibonacci(10);
console.log("Generated sequence:", fibNumbers);

// Additional functionality - sum of Fibonacci numbers
function sumFibonacci(n) {
    const sequence = fibonacciSequence(n);
    const sum = sequence.reduce((acc, num) => acc + num, 0);
    console.log(`Sum of first ${n} Fibonacci numbers: ${sum}`);
    return sum;
}

// Run the enhanced version
sumFibonacci(10);
