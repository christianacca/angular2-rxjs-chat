import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { User, Thread, Message } from '../models';

interface IMessagesOperation extends Function {
  (messages: Message[]): Message[];
}

@Injectable()
export class MessagesService {
  /**
   * a stream that publishes new messages only once
   */
  get newMessages(): Observable<Message> {
    return this._newMessages.asObservable();
  }
  /**
   * a stream for threads whose messages are being marked as read
   */
  get threadBeingRead(): Observable<Thread> {
    return this._threadBeingRead.asObservable();
  };
  // `messages` is a stream that emits an array of the most up to date messages
  messages: Observable<Message[]>;

  // action streams...
  create: Observable<IMessagesOperation>;
  edits: Observable<IMessagesOperation>;
  // `updates` receives _operations_ to be applied to our `messages`
  // it's a way we can perform changes on *all* messages (that are currently 
  // stored in `messages`)
  updates: Observable<IMessagesOperation>;

  private _newMessages: Subject<Message> = new Subject<Message>();
  private _threadBeingRead: Subject<Thread> = new Subject<Thread>();

  constructor() {

    // `create` takes a Message and then puts an operation (the inner function)
    // on the `updates` stream to add the Message to the list of messages.
    //
    // That is, for each item that gets added to `create` (by using `next`)
    // this stream emits a concat operation function.
    //
    // Next we subscribe `this.updates` to listen to this stream, which means
    // that it will receive each operation that is created
    //
    // Note that it would be perfectly acceptable to simply modify the
    // "addMessage" function below to simply add the inner operation function to
    // the update stream directly and get rid of this extra action stream
    // entirely. The pros are that it is potentially clearer. The cons are that
    // the stream is no longer composable.
    this.create = this._newMessages
      .map(m => (msgs: Message[]) => {
        // Cache the most recent message for each thread
        m.thread.lastMessage = m;

        return msgs.concat(m);
      });

    // similarly, `threadBeingRead` takes a Thread and then puts an operation
    // on the `updates` stream to mark the Messages as read
    this.edits = this.threadBeingRead
      .map(thread => {
        return (msgs: Message[]) => {
          return msgs.map(m => {
            // note that we're manipulating `message` directly here. Mutability
            // can be confusing and there are lots of reasons why you might want
            // to, say, copy the Message object or some other 'immutable' here
            if (m.thread.id === thread.id) {
              m.isRead = true;
            }
            return m;
          });
        };
      });

    this.updates = Observable.merge(this.create, this.edits);

    this.messages = this.updates
      // watch the updates and accumulate operations on the messages
      .scan((msgs, op) => op(msgs), [] as Message[])
      // make sure we can share the most recent list of messages across anyone
      // who's interested in subscribing and cache the last known list of
      // messages
      .publishReplay(1)
      .refCount();
  }

  // an imperative function call to this action stream
  addMessage(message: Message): void {
    this._newMessages.next(message);
  }

  markThreadAsRead(thread: Thread): void {
    this._threadBeingRead.next(thread);
  }

  messagesForThreadUser(thread: Thread, user: User): Observable<Message> {
    return this._newMessages
      .filter(m => {
        // belongs to this thread
        return (m.thread.id === thread.id) &&
          // and isn't authored by this user
          (m.author.id !== user.id);
      });
  }
}

export var messagesServiceInjectables: Array<any> = [
  MessagesService
];
