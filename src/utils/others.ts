export function getEnv(key: string, defaultValue?: string): string {
    console.log('ENV:', key, process.env[key]);
    
    return process.env[key] || defaultValue;
}

