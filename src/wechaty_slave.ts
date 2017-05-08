import { FriendRequest, Wechaty } from 'wechaty';
import {
    handleFriendRequest,
    handleLogin,
    handleLogout,
    handleScan,
    recordError,
    recordGroupMessage,
    recordPrivateMessage,
    recordRoomJoin,
    recordRoomLeave,
    recordTopicChange,
} from './utils/actions';

import { getContainerNumer } from './utils/rancher';

var globalNum: string;

async function init() {
    const num = await getContainerNumer();
    globalNum = num || '0';
    setUpBot();
}

function setUpBot() {
    const bot = Wechaty.instance({ profile: `./data/wechaty_slave_${globalNum}` });

    bot.on('scan', (url, code) => {
        console.log({ url, code });
        handleScan(globalNum, url, code);
    });

    bot.on('logout', (user) => {
        console.log('User logout:', user);
        handleLogout(globalNum, user);
    });

    bot.on('login', (user) => {
        console.log('User login:', user.name());
        handleLogin(globalNum, user);
    });

    bot.on('friend', (friend, request: FriendRequest) => {
        handleFriendRequest(friend, request);
    });

    bot.on('room-join', (room, inviteeList, inviter) => {
        console.log('Room join:', room.topic(), '\n', inviteeList.map((c) => c.name()));
        recordRoomJoin(room, inviteeList, inviter);
    });

    bot.on('room-leave', (room, leaverList) => {
        console.log('Room leave:', room.topic(), '\n', leaverList.map(c => c.name()));
        recordRoomLeave(room, leaverList);
    });

    bot.on('room-topic', (room, topic, oldTopic, changer) => {
        console.log('Room topic change:', topic, 'from:', oldTopic, 'changer:', changer.name());
        recordTopicChange(room, topic, oldTopic, changer);
    });

    bot.on('message', (message) => {
        if (message.type() === 1) {
            console.log('Message:', message.content());
        }

        if (message.room()) {
            recordGroupMessage(message);
        } else {
            recordPrivateMessage(message);
        }
    });

    bot.on('heartbeat', (data) => {
        // console.log('heartbeat:', data);
    });

    bot.on('error', (error) => {
        console.error('Wechaty error:', error);
        recordError(error);
    });

    bot.init();
}


init();