import { EntityDataset, Message } from './../models';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
/* tslint:disable:max-line-length */

import { MessagesService } from './MessagesService';
import { ThreadsService } from './ThreadsService';
import { UserService } from './UserService';
import { ChatAppDataGateway } from './ChatAppDataGateway';
import { ChatEntityManager } from './ChatEntityManager';

@Injectable()
export class ChatExampleBots {
  constructor(private messagesService: MessagesService,
    private threadsService: ThreadsService,
    private userService: UserService,
    private dataGateway: ChatAppDataGateway,
    private entityManager: ChatEntityManager) {
  }

  start() {

    const initSubs = this.dataGateway.db$.first()
      .subscribe(initialState => this.initializeChatSelections(initialState));

    const botRepliesSubs = this.botReplies$()
      .subscribe(({ newMessage, received }) => {
        received.isRead = true;
        this.entityManager.save({ messages: [received, newMessage] });
      });

    return [initSubs, botRepliesSubs];
  }

  private botReplies$() {
    const initialState = this.dataGateway.db$.first();

    const echoBotReplies$ = this.messagesForThreadUserNamed$('Echo Bot', initialState)
      .map(m => ({ thread: m.thread, reply: m.text, received: m }));

    const reverseBotReplies$ = this.messagesForThreadUserNamed$('Reverse Bot', initialState)
      .map(m => ({
        thread: m.thread,
        reply: m.text.split('').reverse().join(''),
        received: m
      }));

    const waitingBotReplies$ = this.messagesForThreadUserNamed$('Waiting Bot', initialState)
      .mergeMap(m => {

        let waitTime: number = parseInt(m.text, 10);
        let reply: string;

        if (isNaN(waitTime)) {
          waitTime = 0;
          reply = `I didn\'t understand ${m.text}. Try sending me a number`;
        } else {
          reply = `I waited ${waitTime} seconds to send you this.`;
        }

        return Observable.of({ thread: m.thread, reply, received: m }).delay(waitTime * 1000);
      });

    return Observable.merge(echoBotReplies$, reverseBotReplies$, waitingBotReplies$)
      .map(({ thread, reply, received }) => {
        return {
          received,
          newMessage: new Message({
            author: thread.startedBy,
            text: reply,
            thread: thread
          })
        };
      });
  }

  private initializeChatSelections({ threads, users }: EntityDataset) {
    const me = users.find(u => u.name === 'Juliet');
    this.userService.setCurrentUser(me);

    const tEcho = threads.find(t => t.startedBy.name === 'Echo Bot');
    this.threadsService.setCurrentThread(tEcho);
  }

  private messagesForThreadUserNamed$(name: string, intiailState$: Observable<EntityDataset>) {
    return intiailState$
      .mergeMap(({ threads }) => {
        const thread = threads.find(t => t.startedBy.name === name);
        return this.messagesService
          .unreadMessageForUser$(thread.startedBy, thread);
      });
  }
}
