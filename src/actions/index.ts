import { Contact, Room } from 'wechaty';

export async function inviteToGroup(contact: Contact, roomName: string, welcomeMessage?: string) {
    try {
        const room = await Room.find({ topic: roomName });
        if (room) {
            putInRoom(contact, room, welcomeMessage);
        } else {
            console.error('Room cannot be found:', roomName);
        }
    } catch (error) {
        console.error('Error inviteToGroup:', error);
    }
}

function putInRoom(contact: Contact, room: Room, welcomeMessage?: string) {
    console.info('Bot', 'putInRoom(%s, %s)', contact.name(), room.topic());
    try {
        room.add(contact)
            .catch(e => {
                console.error('Bot', 'room.add() exception: %s', e.stack);
            });
        if (welcomeMessage) {
            setTimeout(_ => room.say(welcomeMessage, contact), 1000);
        }
        // TODO: Add rate limit
    } catch (e) {
        console.error('Bot', 'putInRoom() exception: ' + e.stack);
    }
}