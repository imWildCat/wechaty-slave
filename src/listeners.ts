import * as request from 'request-promise-native';

import { Contact, FriendRequest, Message, Room } from 'wechaty';
import { groupMessageConverter, privateMessageConverter } from './utils/converters/message_converter';
import {
    postGroupMessage,
    postLogin,
    postLoginQRCode,
    postLogout,
    postPrivateMessage,
} from './utils/networking';

import { getEnv } from './utils/others';
import { getMasterHost } from './utils/host';
import { inviteToGroup } from './actions';

const sha1 = require('sha1');

const host = getMasterHost();
const masterKey = getEnv('MASTER_KEY');

function generateSignature(time: string, key: string): string {
    return sha1(`${key}${time}`)
}

function getCurrentTimeString(): string {
    return new Date().toISOString();
}

export async function handleScan(num: string, url: string, code: number) {
    // const qrURL = url.replace('qrcode', 'l');
    console.log('post login qrcode:', url);
    postLoginQRCode({
        num,
        url
    });
}

export async function handleLogout(num: string, user: Contact) {
    postLogout({ num, name: user.name() });
}

export async function handleLogin(num: string, user: Contact) {
    postLogin({ num, name: user.name() });
}

export async function recordGroupMessage(message: Message) {
    try {
        const msgObj = await groupMessageConverter(message);

        const actionsObj = await postGroupMessage(msgObj);
        const actions = transformActionObj(actionsObj);

        actions.map(a => {
            if (a.kind === 'reply' && a.content) {
                message.room().say(a.content);
            }
        });
    } catch (error) {
        console.log('Error while recordGroupMessage:', error);
    }
}

export async function privateMessageListener(message: Message) {
    try {
        const msgObj = await privateMessageConverter(message);
        const actionsObj = await postPrivateMessage(msgObj);
        const actions = transformActionObj(actionsObj);

        actions.map(a => {
            if (a.kind === 'reply' && a.content) {
                message.from().say(a.content);
            } else if (a.kind = 'invite_to_group' && a.group_name) {
                const welcomeMessage = a.welcome_message;
                inviteToGroup(message.from(), a.group_name, welcomeMessage);
            }
        });
    } catch (error) {
        console.log('Error privateMessageListener:', error);
    }
}

export async function handleFriendRequest(friend: Contact, request: FriendRequest) {
    const wx = friend.weixin();
    console.log('wx:', wx);

    await request.accept();
}

export async function recordRoomLeave(room: Room, leavers: Contact[]) {

}

export async function recordTopicChange(room: Room, topic: string, oldTopic: string, changer: Contact) {

}

export async function recordRoomJoin(room: Room, invitees: Contact[], inviter: Contact) {

}

export async function recordError(error: any) {

}

function transformActionObj(actionsObj) {
    const actions = actionsObj || [];
    return actions.map(a => {
        if (!a.kind) {
            a.kind = null;
        }
        return a;
    });
}