import * as _ from 'lodash';
import { uuid as genId } from './util/uuid';

export abstract class EntityBase {
  createdOn: Date;
  id?: number;
  uuid: string;
  protected constructor({ createdOn = new Date(), id, uuid = genId() }: Partial<EntityBase> = {}) {
    Object.assign(this, { createdOn, id, uuid });
  }
  static identity(instance: EntityBase) {
    return instance && instance.uuid;
  }
  static isEquals(left: EntityBase, right: EntityBase) {
    if (left == null && right == null) { return true; }
    if (left == null || right == null) { return false; }

    return EntityBase.identity(left) === EntityBase.identity(right);
  }
  setForeignKeys?(): void;
  setNavigationProperties?(ds: Partial<EntityDataset>): void;
}

export interface EntityDataset {
  messages: Message[];
  threads: Thread[];
  users: User[];
}
export interface DtoDataset {
  messagesData: Partial<Message>[];
  threadsData: Partial<Thread>[];
  usersData: Partial<User>[];
}

export class User extends EntityBase {
  avatarSrc: string;
  name: string;
  constructor({ avatarSrc, createdOn, name, id, uuid }: Partial<User> = {}) {
    super({ createdOn, id, uuid });
    Object.assign(this, { avatarSrc, name });
  }
}

export class Thread extends EntityBase {
  lastMessage: Message;
  startedBy: User;
  startedById: number;

  constructor({ createdOn, id, lastMessage, startedBy, startedById, uuid }: Partial<Thread> = {}) {
    super({ createdOn, id, uuid });
    Object.assign(this, { lastMessage, startedBy, startedById: startedById });
    this.setForeignKeys();
  }

  setForeignKeys() {
    if (this.startedBy) {
      this.startedById = this.startedBy.id;
    }
  }

  setNavigationProperties({ messages = [], users = []}: Partial<EntityDataset>) {
    const navProps = {
      startedBy: users.find(u => u.id === this.startedById) || this.startedBy
    };
    Object.assign(this, navProps);
    const msgsForThread = messages.filter(m => m.threadId === this.id);
    const latestMsg = _(msgsForThread).sortBy(m => m.sentAt).last();
    if (!this.lastMessage || this.lastMessage.sentAt < latestMsg.sentAt) {
      this.lastMessage = latestMsg;
    }
  }
}

export class Message extends EntityBase {
  sentAt: Date;
  isRead: boolean;
  author: User;
  authorId: number;
  text: string;
  thread: Thread;
  threadId: number;

  constructor(obj?: any) {
    super(obj);
    this.isRead = obj && obj.isRead || false;
    this.sentAt = obj && obj.sentAt || new Date();
    this.author = obj && obj.author || null;
    this.authorId = obj && obj.authorId || null;
    this.text = obj && obj.text || null;
    this.thread = obj && obj.thread || null;
    this.threadId = obj && obj.threadId || null;
    this.setForeignKeys();
  }

  setNavigationProperties({ users = [], threads = []}: Partial<EntityDataset>) {
    const navProps = {
      author: users.find(u => u.id === this.authorId) || this.author,
      thread: threads.find(t => t.id === this.threadId) || this.thread
    };
    Object.assign(this, navProps);

    const thread = this.thread;
    if (thread && EntityBase.isEquals(thread.lastMessage, this)) {
      thread.lastMessage = this;
    }

    if (thread && (!thread.lastMessage || thread.lastMessage.sentAt < this.sentAt)) {
      thread.lastMessage = this;
    }
  }

  setForeignKeys() {
    if (this.thread) {
      this.threadId = this.thread.id;
    }
    if (this.author) {
      this.authorId = this.author.id;
    }
  }
}
