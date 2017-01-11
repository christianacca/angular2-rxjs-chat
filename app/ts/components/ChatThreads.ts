import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';
import {ThreadsService} from '../services/services';
import {Observable} from 'rxjs';
import {Thread} from '../models';

@Component({
  inputs: ['thread'],
  selector: 'chat-thread',
  template: `
  <div class="media conversation">
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
  </div>
  `
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
    <!-- conversations -->
    <div class="row">
      <div class="conversation-wrap">

        <chat-thread
             *ngFor="let thread of threads | async"
             [thread]="thread">
        </chat-thread>

      </div>
    </div>
  `
})
export class ChatThreads {
  threads: Observable<any>;

  constructor(public threadsService: ThreadsService) {
    this.threads = threadsService.orderedThreads;
  }
}
