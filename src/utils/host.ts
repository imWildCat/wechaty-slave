import {getEnv} from './others';

export function getMasterHost(): string {
    if(getEnv('NODE_ENV', 'development') === 'production') {
        const masterHost = getEnv('MASTER_HOST', 'app');
        const masterPort = getEnv('MASTER_PORT', '3000');
        const masterProtocol = getEnv('MASTER_PROTOCOL', 'http');
        return `${masterProtocol}://${masterHost}:${masterPort}`;
    } else {
        return 'http://localhost:3000';
    }
}

export function getMasterPath(): string {
    const path = getEnv('MASTER_PATH', '/wechaty_slave');
    return path;
}