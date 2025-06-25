export const withRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000,
    backoff = 2
): Promise<T> => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, i)));
            }
        }
    }

    throw lastError;
};