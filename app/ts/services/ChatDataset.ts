import * as _ from 'lodash';
import { EntityDataset, Message, Thread, User, EntityBase } from './../models';

function assignDataValue(objValue, srcValue, key, object, source) {
    return isDataValue(srcValue) ? srcValue : objValue;
}

function isDataValue(value) {
    return _.isNumber(value) || _.isString(value) || _.isDate(value);
}

export class ChatDataset implements EntityDataset {
    messages: Message[];
    threads: Thread[];
    users: User[];

    constructor(ds: Partial<EntityDataset>) {
        Object.assign(this, {
            messages: this.getAllMessages(ds),
            threads: this.getAllThreads(ds),
            users: this.getAllUsers(ds)
        });
    }

    static create(ds: Partial<EntityDataset>) {
        return new ChatDataset(ds);
    }

    static merge(receiving: ChatDataset, incoming: ChatDataset) {
        return receiving ? receiving.merge(incoming) : incoming;
    }

    merge(incoming: Partial<EntityDataset>) {
        const incomingDs = new ChatDataset(incoming);

        const users = this.mergeDataProps(this.users, incomingDs.users);
        const messages = this.mergeDataProps(this.messages, incomingDs.messages);
        const threads = this.mergeDataProps(this.threads, incomingDs.threads);

        const result = { messages, threads, users };
        messages.forEach(m => m.setNavigationProperties(result));
        threads.forEach(t => t.setNavigationProperties(result));

        return new ChatDataset(result);
    }

    private mergeDataProps<T extends EntityBase>(existing: T[], incoming: T[]) {
        return _(existing)
            .concat(incoming)
            .uniq()
            .groupBy('uuid')
            .map((entities: T[]) => _.assignWith(entities[0], ...entities.slice(1), assignDataValue) as T)
            .value();
    }

    private getAllMessages({ messages = [], threads = [] }: Partial<EntityDataset>) {
        return _.uniq(threads.map(t => t.lastMessage).concat(messages).filter(_.identity));
    }

    private getAllThreads({ messages = [], threads = [] }: Partial<EntityDataset>) {
        return _.uniq(messages.map(m => m.thread).concat(threads).filter(_.identity));
    }

    private getAllUsers({ messages = [], threads = [], users = [] }: Partial<EntityDataset>) {
        return _.uniq(users
            .concat(messages.map(m => m.author))
            .concat(threads.map(t => t.startedBy))
            .filter(_.identity)
        );
    }
}
