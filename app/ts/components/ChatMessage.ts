import {
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import {Message, User} from '../models';

@Component({
  selector: 'chat-message',
  template: `
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
  `,
  host: {
    '[class.base-sent]': '!incoming',
    '[class.base-receive]': 'incoming'
  }
})
export class ChatMessage implements OnChanges {
  @Input() message: Message;
  @Input() currentUser: User;
  incoming: boolean;

  ngOnChanges(): void {
    this.incoming = this.message.author !== this.currentUser;
  }
}
