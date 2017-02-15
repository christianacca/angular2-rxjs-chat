import { UserService } from './UserService';
import { ChatEntityManager } from './ChatEntityManager';
import { ChatAppDataGateway } from './ChatAppDataGateway';
import { ConnectableObservable, Observable, Subject } from 'rxjs';
import { Injectable, Provider } from '@angular/core';
import { Message, Thread, User } from '../models';
import * as _ from 'lodash';

interface IMessagesOperation extends Function {
  (messages: Message[]): Message[];
}

function isObservable<T>(val: any): val is Observable<T> {
  return val && typeof val['subscribe'] === 'function';
}

@Injectable()
export class MessagesService {
  /**
   * a stream that publishes new messages only once
   */
  outgoingMessages$: Observable<Message>;
  /**
   * `messages` is a stream that emits an array of the most up to date messages
   */
  messages$: Observable<Message[]>;

  private _outgoingMessages$ = new Subject<Message>();
  private threadBeingRead$ = new Subject<Thread>();
  private hotObservables: ConnectableObservable<any>[] = [];

  constructor(
    private dataGateway: ChatAppDataGateway,
    private entityManager: ChatEntityManager,
    private userService: UserService) {

    console.log('MessagesService created');
    this.outgoingMessages$ = this._outgoingMessages$.asObservable();

    const changes$ = this.changeActions$();
    this.hotObservables.push(changes$);

    this.messages$ = changes$;
  }

  // an imperative function call to this action stream
  addMessage(message: Message): void {
    this._outgoingMessages$.next(message);
  }

  markThreadAsRead(thread: Thread): void {
    this.threadBeingRead$.next(thread);
  }



  unreadMessageForUser$(
    userOrUser$: User | Observable<User>,
    threadOrThread$: Thread | Observable<Thread> | undefined): Observable<Message> {

    return this.unreadMessagesForUser$(userOrUser$, threadOrThread$)
      .mergeMap(messages => Observable.from(messages));
  }

  unreadMessagesForUser$(
    userOrUser$: User | Observable<User>,
    threadOrThread$: Thread | Observable<Thread>): Observable<Message[]> {

    const thread$ = !isObservable(threadOrThread$) ? Observable.of(threadOrThread$) : threadOrThread$;
    const user$ = !isObservable(userOrUser$) ? Observable.of(userOrUser$) : userOrUser$;

    return Observable.combineLatest(thread$, user$, this.dataGateway.db$)
      .map(([thread, user, { messages }]) => {
        const matches = messages.filter(m => {
          // belongs to this thread
          return (m.thread === thread) &&
            // and isn't authored by this user
            (m.author !== user) &&
            !m.isRead;
        });
        return matches;
      })
      .distinct()
      .share();
  }

  start() {
    // calling connect, our observer chains will recieve 
    // emissions even if no one subscribes.
    // ie we're making observables "hot"
    return this.hotObservables.map(o => o.connect());
  }

  private createActions$() {
    // `creates` takes a Message and then puts an operation (the inner function)
    // on the `changes` stream to add the Message to the list of messages.
    //
    // That is, for each item that gets added to `creates` (by using `next`)
    // this stream emits a concat operation function.
    //
    // We subscribe `this.changes` to listen to this stream, which means
    // that it will receive each operation that is created
    //
    // Note that it would be perfectly acceptable to simply modify the
    // "addMessage" function below to simply add the inner operation function to
    // the update stream directly and get rid of this extra action stream
    // entirely. The pros are that it is potentially clearer. The cons are that
    // the stream is no longer composable.
    return this._outgoingMessages$
      .map(m => (msgs: Message[]) => {
        this.entityManager.save({ messages: [m] });
        return msgs.concat(m);
      })
      .do(() => {
        console.log('creates emitted');
      });
  }

  /**
   * `changes` receives _operations_ to be applied to our `messages`
   * it's a way we can perform changes on *all* messages (that are currently 
   * stored in `messages`)
   */
  private changeActions$() {
    return Observable.merge(
      this.serverChangeActions$(),
      this.createActions$(),
      this.editActions$()
    )
      // watch the changes and accumulate operations on the messages
      .scan((msgs, op) => op(msgs), [] as Message[])
      .do(() => {
        console.log('changes emitted');
      })
      // share the most recent list of messages across anyone
      .publishReplay(1);
  }

  private serverChangeActions$() {
    return this.dataGateway.db$
      .map(incoming => function (msgs: Message[]) {
        return _.unionBy<Message>(incoming.messages, msgs, 'uuid');
      })
      .do(() => {
        console.log('serverChangeActions emitted');
      });
  }

  private editActions$() {
    // similarly, `threadBeingRead$` takes a Thread and then puts an operation
    // on the `changes` stream to mark the Messages as read
    return this.threadBeingRead$
      .withLatestFrom(this.userService.currentUser$)
      .map(([ thread, user ]) => (msgs: Message[]) => {
        return msgs
          .map(m => {
            // note that we're manipulating `message` directly here. Mutability
            // can be confusing and there are lots of reasons why you might want
            // to, say, copy the Message object or some other 'immutable' here
            if (!m.isRead && m.thread === thread && m.author !== user) {
              m.isRead = true;
              this.entityManager.save({ messages: [m] });
            }
            return m;
          });
      })
      .do(() => {
        console.log('edits emitted');
      });
  }
}

export var messagesServiceInjectables: Array<Provider> = [
  MessagesService
];
