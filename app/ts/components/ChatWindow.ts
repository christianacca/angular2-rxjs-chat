import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {Message, Thread} from '../models';
import {
  MessagesService,
  ThreadsService,
  UserService,
} from '../services';
import {Observable, Subject, Subscription} from 'rxjs';

import { ChatMessage } from './ChatMessage';

@Component({
  selector: 'chat-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel-container">
      <div class="panel panel-default">

        <div class="panel-heading top-bar">
          <div class="panel-title-container">
            <h3 class="panel-title">
              <span class="glyphicon glyphicon-comment"></span>
              Chat - {{(currentThread$ | async).name}}
            </h3>
          </div>
          <div class="panel-buttons-container">
            <!-- you could put minimize or close buttons here -->
          </div>
        </div>

        <div class="panel-body msg-container-base" #messageContainer>
          <chat-message
                *ngFor="let message of messages$ | async"
                [message]="message"
                [currentUser]="userService.currentUser | async">
          </chat-message>
        </div>

        <div class="panel-footer">
          <div class="input-group">
            <input type="text" 
                    class="chat-input"
                    placeholder="Write your message here..."
                    (keydown.enter)="sendMessage$.next($event)"
                    [(ngModel)]="draftMessage.text" />
            <span class="input-group-btn">
              <button class="btn-chat"
                  (click)="sendMessage$.next($event)"
                  >Send</button>
            </span>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ChatWindow implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('messageContainer') messageContainer: ElementRef;
  @ViewChildren(ChatMessage) messageComponents: QueryList<ChatMessage>;
  currentThread$: Observable<Thread>;
  draftMessage: Message;
  messages$: Observable<Message[]>;
  sendMessage$ = new Subject<any>();
  private updatesSub: Subscription;

  constructor(public messagesService: MessagesService,
              public threadsService: ThreadsService,
              public userService: UserService,
              public el: ElementRef) {
  }

  ngAfterViewInit() {
    // subscription and DOM tree has same lifetime (ie both disposed at the same time) therefore no need to
    // unsubscribe
    this.messageComponents.changes.subscribe(() => {
      this.scrollToBottom();
    });
  }

  ngOnInit(): void {
    this.currentThread$ = this.threadsService.currentThread;
    this.messages$ = this.threadsService.currentThreadMessages.do(() => {
      console.log(`ChatWindow.messages$ emitted`);
    });
    this.draftMessage = new Message();

    this.updatesSub = Observable.merge(
      this.readThreadActions(),
      this.sendMessageActions()
    ).subscribe(action => {
      action();
    });
  }

  ngOnDestroy() {
    this.updatesSub.unsubscribe();
  }

  private readThreadActions() {
    const unreadMessages$ = this.messages$
      .filter(msgs => msgs.filter(m => !m.isRead).length > 0);

    return unreadMessages$
      .map(([msg]) => () => {
        this.messagesService.markThreadAsRead(msg.thread);
      });
  }

  private sendMessageActions() {
    const newMessages$ = this.sendMessage$
      .withLatestFrom(this.userService.currentUser, this.currentThread$)
      .map(([, author, thread]) => {
        return Object.assign({}, this.draftMessage, {author, thread, isRead: true}) as Message;
      });

    return newMessages$
      .map(m => () => {
        this.sendMessage(m);
      });
  }

  private scrollToBottom(): void {
    // todo: find a way to use the Renderer service to do this instead
    let scrollPane = this.messageContainer.nativeElement;
    scrollPane.scrollTop = scrollPane.scrollHeight;
  }

  private sendMessage(msg: Message): void {
    this.messagesService.addMessage(msg);
    this.draftMessage = new Message();
  }
}
