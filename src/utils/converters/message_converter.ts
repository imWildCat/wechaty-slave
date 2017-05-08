import { Contact, Message, MsgType } from 'wechaty';

import {uploadImage} from '../image_uploaders/uploader';

const avatarCache = {};

export async function groupMessageConverter(message: Message) {
    const room = message.room();
    const sender = message.from();
    const receiver = message.to();
    const content = message.content();

    if (!receiver) {
        throw('null receiver');
    }

    const topic = room.topic();

    const myName = receiver.name();
    const myWx = receiver.weixin();
    const fromName = sender.name();
    const myAlias = room.alias(receiver);
    const type = message.type();

    if ([MsgType.TEXT, MsgType.IMAGE].indexOf(type) === -1) {
        // if it is not a text or image
        console.info('this message is not text or image');
        throw('this message is not text or image');
    }

    const senderID = sender.id;
    const avatarPath = await uploadAvatar(sender);

    try {
        const mappedMessage = await messageMapper(message);
        const params = {
            ...mappedMessage, avatar_url: avatarPath,
            bot_alias: myAlias,
            bot_name: myName,
            bot_wx: myWx,
            group_name: topic,
            username: fromName
        };
        return params;
    } catch (error) {
        console.log('Error while creating message json:', error);
        return null;
    }
}

export async function privateMessageConverter(message: Message) {
    const sender = message.from();
    const receiver = message.to();
    const type = message.type();
    
    let avatar_url = null;
    try {        
        avatar_url = await uploadAvatar(sender);
    } catch (error) {
        console.log('Error while upload avatar for private message:', error);
    }
    let mappedMessage;
    if (type === MsgType.IMAGE) {
        mappedMessage = await messageMapper(message);
    } else if (type === MsgType.TEXT) {
        mappedMessage = {
            kind: 'text',
            content: message.content()
        };
    }
    return {
        receiver_name: receiver.name(),
        sender_name: sender.name(),
        avatar_url,
        is_self: message.self(),
        ...mappedMessage
    }
}


async function messageMapper(message: Message) {
    const type = message.type();
    if (type === MsgType.TEXT) {
        return await textMessageMapper(message);
    } else if (type === MsgType.IMAGE) {
        return await imageMessageMapper(message);
    }
}

async function textMessageMapper(message: Message) {
    const room = message.room();
    const receiver = message.to();
    const content = message.content();
    const myAlias = room.alias(receiver);
    const matchRegexString = `@${myAlias}`;
    const re = new RegExp(matchRegexString, 'g');
    const at_me = re.test(content);

    // console.log('at me:', at_me);

    return {
        kind: 'text',
        content: content,
        at_me
    };
}

async function imageMessageMapper(message: Message) {
    let imageURL = null;
    try {
        imageURL = await uploadImage(await message.readyStream());
    } catch (error) {
        console.error('Error while uploading image:', error);
    }
    return {
        kind: 'image',
        content: imageURL
    };
}

async function uploadAvatar(contact: Contact) {
    const senderID = contact.id;
    let avatarPath: string = null;
    if (!avatarCache[senderID]) {
        try {
            const avatarReadStream = await contact.avatar();
            avatarPath = await uploadImage(avatarReadStream);

            avatarCache[senderID] = avatarPath;
        } catch (error) {
            console.log('Error while uploading image:', error);
        }
    } else {
        avatarPath = avatarCache[senderID];
    }
    // console.log('avatarPath:', avatarPath);
    
    return avatarPath;
}