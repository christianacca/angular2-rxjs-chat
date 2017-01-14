import {Component, OnInit} from '@angular/core';
import {MessagesService, ThreadsService} from '../services';

import { Observable } from 'rxjs';

@Component({
  selector: 'nav.navbar',
  template: `
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="https://ng-book.com/2">
        <img src="${require('images/logos/ng-book-2-minibook.png')}"/>
          ng-book 2
      </a>
    </div>
    <p class="navbar-text navbar-left">
      <use-case-ctrl-buttons></use-case-ctrl-buttons>
    </p>
    <p class="navbar-text navbar-right">
      <button class="btn btn-primary" type="button">
        Messages <span class="badge">{{unreadMessagesCount | async}}</span>
      </button>
    </p>
  </div>
  `,
  host: {
    'class': 'navbar-default'
  }
})
export class ChatNavBar implements OnInit {
  unreadMessagesCount: Observable<number>;

  constructor(public messagesService: MessagesService,
              public threadsService: ThreadsService) {
  }

  ngOnInit(): void {
    this.unreadMessagesCount = this.messagesService.messages
      .map(msgs =>
        // note: in a "real" app you should also exclude 
        // messages that were authored by the current user b/c they've
        // already been "read"
        msgs.reduce((sum, m) => !m.isRead ? ++sum : sum, 0));
  }
}

