import * as request from 'request-promise-native';

import { getMasterHost, getMasterPath } from './host';

import { getEnv } from './others';

const host = getMasterHost();
const path = getMasterPath();
const prefix = host + path;
const TOKEN = getEnv('MASTER_TOKEN', 'foobar');
const options = {
    headers: {
        'User-Agent': 'WeChaty Slave',
        'Token': TOKEN
    }
};

export async function postGroupMessage(messageObj) {
    try {
        const response = await request.post(`${prefix}/group_message`, {
            ...options, json: {
                ...messageObj
            }
        });
        return response.actions;
    } catch (error) {
        console.error('Error while postGroupMessage');
        return null;
    }
}

export async function postPrivateMessage(messageObj) {
    try {
        const response = await request.post(`${prefix}/private_message`, {
            ...options, json: {
                ...messageObj
            }
        });
        return response.actions;
    } catch (error) {
        console.error('Error while postPrivateMessage:');
        return null;
    }
}

export async function postLogin(dataObj) {
    try {
        const response = await request.post(`${prefix}/login`, {
            ...options, json: {
                ...dataObj
            }
        });
        return response.actions;
    } catch (error) {
        console.error('Error while postLogin');
        return null;
    }
}

export async function postLogout(dataObj) {
    try {
        const response = await request.post(`${prefix}/logout`, {
            ...options, json: {
                ...dataObj
            }
        });
        return response.actions;
    } catch (error) {
        console.error('Error while postLogout');
        return null;
    }
}

export async function postLoginQRCode(dataObj) {
    try {
        const response = await request.post(`${prefix}/scan`, {
            ...options, json: {
                ...dataObj
            }
        });
        return response.actions;
    } catch (error) {
        console.error('postLoginQRCode');
        return null;
    }
}