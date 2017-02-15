import { ChatAppDataGateway } from './../services/ChatAppDataGateway';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  MessagesService,
  ThreadsService,
  UserService,
} from '../services';

import { ChatExampleBots } from '../services';
import { UseCaseManager } from './../shared/use-case';
import { servicesInjectables } from '../services';

/**
 * Copyright 2016, Fullstack.io, LLC.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree. 
 *
 */

@Component({
  selector: 'chat-app-impl',
  template: `
  <nav class="navbar"></nav>
  <div class="container">
    <chat-threads class="row"></chat-threads>
    <chat-window></chat-window>
  </div>
  `,
  providers: [
    servicesInjectables
  ],
  styles: [`
    :host { display: block }
  `]
})
export class ChatAppImpl implements OnDestroy, OnInit {
  constructor(public messagesService: MessagesService,
    private threadsService: ThreadsService,
    private userService: UserService,
    private useCase: UseCaseManager,
    private exampleBots: ChatExampleBots,
    private dataGateway: ChatAppDataGateway) {
      console.log('ChatApp created');
  }

  ngOnDestroy() {
    console.log('ChatApp destroyed');
  }

  ngOnInit() {
    // note: strictly speaking we don't need to have UseCaseManager
    // start our services for us.
    // This is because internally MessagesService (etc)
    // do not create state that lives longer than they do themselves.
    // Once the use-case-content directive kills me, my messagesService
    // (etc) will be garbage collect

    this.useCase.start(this.dataGateway, this.messagesService, this.threadsService, this.exampleBots);
  }
}

@Component({
  selector: 'chat-app',
  template: `
  <chat-app-impl *use-case-content></chat-app-impl>
  `,
  styles: [`
    :host { display: block }
  `]
})
export class ChatApp {}

