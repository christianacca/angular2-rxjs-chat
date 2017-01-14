import * as _ from 'underscore';

import {ConnectableObservable, Observable, Subject} from 'rxjs';
import {Message, Thread} from '../models';

import {Injectable} from '@angular/core';
import {MessagesService} from './MessagesService';

@Injectable()
export class ThreadsService {

  // `threads` is a observable that contains the most up to date list of threads
  threads: Observable<{ [key: string]: Thread }>;

  // `orderedThreads` contains a newest-first chronological list of threads
  orderedThreads: Observable<Thread[]>;

  // `currentThread` contains the currently selected thread
  currentThread: Observable<Thread>;

  // `currentThreadMessages` contains the set of messages for the currently
  // selected thread
  currentThreadMessages: Observable<Message[]>;

  private changeThread = new Subject<Thread>();
  private hotObservables: ConnectableObservable<any>[] = [];

  constructor(public messagesService: MessagesService) {
    console.log('ThreadsService created');
    const changes = this.changeActions();
    this.hotObservables.push(changes);

    this.currentThread = changes;
    this.threads = this._threads();
    this.orderedThreads = this._orderedThreads();
    this.currentThreadMessages = this._currentThreadMessages();
  }

  setCurrentThread(newThread: Thread): void {
    this.changeThread.next(newThread);
  }

  start() {
    return this.hotObservables.map(o => o.connect());
  }

  private changeActions() {
    return Observable.merge(
        this.changeThread.startWith(new Thread())
      )
      .publishReplay(1);
  }

  private _currentThreadMessages() {
    return this.currentThread
      .combineLatest(this.messagesService.messages,
                     (currentThread, msgs) =>
                     msgs.filter(m => m.thread.id === currentThread.id))
      .do(() => {
        console.log('currentThreadMessages emitted');
      })
      .publishReplay(1)
      .refCount();
  }

  private _orderedThreads() {
    return this.threads
      .map((threadGroups: { [key: string]: Thread }) => {
        let threads: Thread[] = _.values(threadGroups);
        return _.sortBy(threads, t => t.lastMessage.sentAt).reverse();
      })
      .do(() => {
        console.log('orderedThreads emitted');
      })
      .publishReplay(1)
      .refCount();
  }

  private _threads() {
    return this.messagesService.messages
      .map(msgs => msgs.reduce(
        (acc, m) => Object.assign(acc, { [m.thread.id]: m.thread }),
        {}))
      .do(() => {
        console.log('threads emitted');
      })
      .publishReplay(1)
      .refCount();
  }
}

export var threadsServiceInjectables: Array<any> = [
  ThreadsService
];
