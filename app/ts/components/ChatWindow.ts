import {
  Component,
  AfterViewInit,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  MessagesService,
  ThreadsService,
  UserService
} from '../services/services';
import {Observable, Subject, Subscription} from 'rxjs';
import {User, Thread, Message} from '../models';

@Component({
  selector: 'chat-message',
  template: `
  <div class="msg-container"
       [ngClass]="{'base-sent': !incoming, 'base-receive': incoming}">

    <div class="avatar"
         *ngIf="!incoming">
      <img src="{{message.author.avatarSrc}}">
    </div>

    <div class="messages"
      [ngClass]="{'msg-sent': !incoming, 'msg-receive': incoming}">
      <p>{{message.text}}</p>
      <p class="time">{{message.sender}} • {{message.sentAt | fromNow}}</p>
    </div>

    <div class="avatar"
         *ngIf="incoming">
      <img src="{{message.author.avatarSrc}}">
    </div>
  </div>
  `
})
export class ChatMessage implements OnChanges {
  @Input() message: Message;
  @Input() currentUser: User;
  incoming: boolean;

  ngOnChanges(): void {
    this.incoming = this.message.author.id !== this.currentUser.id;
  }
}

@Component({
  selector: 'chat-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat-window-container">
      <div class="chat-window">
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
      </div>
    </div>
  `
})
export class ChatWindow implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('messageContainer') messageContainer: ElementRef;
  @ViewChildren(ChatMessage) messageComponents: QueryList<ChatMessage>;
  currentThread$: Observable<Thread>;
  draftMessage: Message;
  messages$: Observable<any>;
  sendMessage$ = new Subject<any>();
  private newMessagesSub: Subscription;

  constructor(public messagesService: MessagesService,
              public threadsService: ThreadsService,
              public userService: UserService,
              public el: ElementRef) {
  }

  ngAfterViewInit() {
    this.messageComponents.changes.subscribe(() => {
      this.scrollToBottom();
    });
  }

  ngOnInit(): void {
    this.currentThread$ = this.threadsService.currentThread;
    this.messages$ = this.threadsService.currentThreadMessages;
    this.draftMessage = new Message();

    this.newMessagesSub = this.newMessages$().subscribe(m => {
      this.sendMessage(m);
    });
  }

  ngOnDestroy() {
    this.newMessagesSub.unsubscribe();
  }

  private newMessages$() {
    return this.sendMessage$
      .withLatestFrom(this.userService.currentUser, this.currentThread$)
      .map(([, author, thread]) => {
        return Object.assign({}, this.draftMessage, {author, thread, isRead: true}) as Message;
      });
  }

  private sendMessage(msg: Message): void {
    this.messagesService.addMessage(msg);
    this.draftMessage = new Message();
  }

  private scrollToBottom(): void {
    // todo: find a way to use the Renderer service to do this instead
    let scrollPane = this.messageContainer.nativeElement;
    scrollPane.scrollTop = scrollPane.scrollHeight;
  }
}
