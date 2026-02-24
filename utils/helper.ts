export const helper = {
    randomEmail: () => `test-${Date.now()}@example.com`,
    randomNumber: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};
