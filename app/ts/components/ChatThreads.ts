import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';

import {Observable} from 'rxjs';
import {Thread} from '../models';
import {ThreadsService} from '../services';

@Component({
  inputs: ['thread'],
  selector: 'chat-thread',
  template: `
  <div class="pull-left">
    <img class="media-object avatar" 
          src="{{thread.avatarSrc}}">
  </div>
  <div class="media-body">
    <h5 class="media-heading contact-name">{{thread.name}}
      <span *ngIf="selected | async">&bull;</span>
    </h5>
    <small class="message-preview">{{thread.lastMessage.text}}</small>
  </div>
  `,
  host: {'class': 'media conversation'}
})
export class ChatThread implements OnInit {
  thread: Thread;
  selected: Observable<boolean>;

  constructor(public threadsService: ThreadsService) {
  }

  ngOnInit(): void {
    this.selected = this.threadsService.currentThread
      .map(currentThread => currentThread && (currentThread.id === this.thread.id));
  }

  @HostListener('click') clicked(): void {
    this.threadsService.setCurrentThread(this.thread);
  }
}


@Component({
  selector: 'chat-threads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <div class="conversation-wrap">
    <chat-thread
          *ngFor="let thread of threads | async"
          [thread]="thread">
    </chat-thread>
  </div>
  `,
  styles: [`:host { display: block }`]
})
export class ChatThreads {
  threads: Observable<any>;

  constructor(public threadsService: ThreadsService) {
    this.threads = threadsService.orderedThreads;
  }
}
