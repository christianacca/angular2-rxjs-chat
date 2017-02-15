import * as moment from 'moment';

import { Message, Thread, User } from './models';

import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryChatDbService implements InMemoryDbService {
    createDb() {

        // the person using the app us Juliet
        let me: User = new User({ 
            avatarSrc: require('images/avatars/female-avatar-1.png'), 
            name: 'Juliet',
            id: 1,
            uuid: '9288F087-ECF1-475A-94EA-A0369A740421'
        });
        let ladycap: User = new User({ 
            avatarSrc: require('images/avatars/female-avatar-2.png'), 
            name: 'Lady Capulet',
            id: 2,
            uuid: 'BFD01625-BE61-49D0-B62E-8DB069012A8A'
        });
        let echo: User = new User({ 
            avatarSrc: require('images/avatars/male-avatar-1.png'), 
            name: 'Echo Bot',
            id: 3,
            uuid: 'A30D7A87-170D-437E-B86D-AD62F55CA583'
        });
        let rev: User = new User({ 
            avatarSrc: require('images/avatars/female-avatar-4.png'), 
            name: 'Reverse Bot',
            id: 4,
            uuid: '7D6C569E-8DBA-4A64-A2B1-DF4BC077A900'
        });
        let wait: User = new User({ 
            avatarSrc: require('images/avatars/male-avatar-2.png'), 
            name: 'Waiting Bot',
            id: 5,
            uuid: '1695B34D-B934-4E35-9B9C-39E6E0220E6F'
        });

        const users = [me, ladycap, echo, rev, wait];

        let tLadycap: Thread = new Thread({ 
            startedById: ladycap.id, id: 1, uuid: 'B004C72B-6003-4051-86C8-1AFA3B2A949E' 
        });
        let tEcho: Thread = new Thread({ 
            startedById: echo.id, id: 2, uuid: 'E3D15291-4B11-43F3-B735-69FD86A888FC' 
        });
        let tRev: Thread = new Thread({ 
            startedById: rev.id, id: 3, uuid: '1A3DD6F7-082F-46A8-B6A8-437A2EAC345F' 
        });
        let tWait: Thread = new Thread({ 
            startedById: wait.id, id: 4, uuid: 'D329FF24-A6D0-4771-8116-1E729859BB82' 
        });

        const threads = [tLadycap, tEcho, tRev, tWait];

        const messages = [
            new Message({
                authorId: me.id,
                sentAt: moment().subtract(45, 'minutes').toDate(),
                text: 'Yet let me weep for such a feeling loss.',
                threadId: tLadycap.id,
                id: 1,
                uuid: '5A92C0D1-B578-4100-9850-FAA027A3C505',
                isRead: true
            }),
            new Message({
                authorId: ladycap.id,
                sentAt: moment().subtract(20, 'minutes').toDate(),
                text: 'So shall you feel the loss, but not the friend which you weep for.',
                threadId: tLadycap.id,
                id: 2,
                uuid: 'CFC898B1-BB6C-401F-BFCA-9015021F3E69'
            }),
            new Message({
                authorId: echo.id,
                sentAt: moment().subtract(1, 'minutes').toDate(),
                text: `I\'ll echo whatever you send me`,
                threadId: tEcho.id,
                id: 3,
                uuid: '1C55E53A-35D3-4ACD-86DB-CF48E0A2B514'
            }),
            new Message({
                authorId: rev.id,
                sentAt: moment().subtract(3, 'minutes').toDate(),
                text: `I\'ll reverse whatever you send me`,
                threadId: tRev.id,
                id: 4,
                uuid: '3F71B8D4-8C29-44F2-864F-EDBF4870DF6B'
            }),
            new Message({
                authorId: wait.id,
                sentAt: moment().subtract(4, 'minutes').toDate(),
                text: `I\'ll wait however many seconds you send to me before responding. Try sending '3'`,
                threadId: tWait.id,
                id: 5,
                uuid: 'AEE20866-D01B-4F7B-8C2C-ADD1F11660DC'
            }),
        ];

        return {
            messages,
            threads,
            users
        };
    }
}
