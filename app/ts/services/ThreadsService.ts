import {Injectable} from '@angular/core';
import {Subject, BehaviorSubject, Observable} from 'rxjs';
import {Thread, Message} from '../models';
import {MessagesService} from './MessagesService';
import * as _ from 'underscore';

@Injectable()
export class ThreadsService {

  // `threads` is a observable that contains the most up to date list of threads
  threads: Observable<{ [key: string]: Thread }>;

  // `orderedThreads` contains a newest-first chronological list of threads
  orderedThreads: Observable<Thread[]>;

  // `currentThread` contains the currently selected thread
  currentThread: Subject<Thread> =
    new BehaviorSubject<Thread>(new Thread());

  // `currentThreadMessages` contains the set of messages for the currently
  // selected thread
  currentThreadMessages: Observable<Message[]>;

  constructor(public messagesService: MessagesService) {

    this.threads = messagesService.messages
      .map(msgs => msgs.reduce(
        (acc, m) => Object.assign(acc, { [m.thread.id]: m.thread }),
        {}));

    this.orderedThreads = this.threads
      .map((threadGroups: { [key: string]: Thread }) => {
        let threads: Thread[] = _.values(threadGroups);
        return _.sortBy(threads, t => t.lastMessage.sentAt).reverse();
      });

    this.currentThreadMessages = this.currentThread
      .combineLatest(messagesService.messages,
                     (currentThread, msgs) =>
                     msgs.filter(m => m.thread.id === currentThread.id))
      .do(msgs => {
        msgs.forEach(m => {
          m.isRead = true;
        });
      })
      .share();

    this.currentThread
      .subscribe(t => this.messagesService.markThreadAsRead(t));
  }

  setCurrentThread(newThread: Thread): void {
    this.currentThread.next(newThread);
  }

}

export var threadsServiceInjectables: Array<any> = [
  ThreadsService
];
