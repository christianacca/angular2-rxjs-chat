/**
 * Copyright 2016, Fullstack.io, LLC.
 *
 * This source code is licensed under the MIT-style license found in the
 * LICENSE file in the root directory of this source tree. 
 *
 */

import { ChatApp, ChatAppImpl } from './components/ChatApp';
import {
  ChatThread,
  ChatThreads,
} from './components/ChatThreads';
import {
  Component,
  NgModule,
} from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import {
  ChatMessage,
} from './components/ChatMessage';
import { ChatNavBar } from './components/ChatNavBar';
import {
  ChatWindow,
} from './components/ChatWindow';
import {
  FormsModule,
} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { InMemoryChatDbService } from './InMemoryChatDbService';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { UseCaseModule } from './shared/use-case/index';
import { dataServicesInjectables } from './services';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { utilInjectables } from './util/util';


/*
 * Webpack
 */
require('../css/styles.css');


@Component({
  selector: 'app',
  template: `
  <ng-container use-case>
    <chat-app></chat-app>
  </ng-container>
  `
})
class App {}

@NgModule({
  declarations: [
    App,
    ChatApp,
    ChatAppImpl,
    ChatNavBar,
    ChatThreads,
    ChatThread,
    ChatWindow,
    ChatMessage,
    utilInjectables
  ],
  imports: [
    BrowserModule,
    FormsModule,
    UseCaseModule,
    HttpModule,
    InMemoryWebApiModule.forRoot(InMemoryChatDbService, { post204: false })
  ],
  providers: [dataServicesInjectables],
  bootstrap: [App]
})
export class ChatAppModule { }

platformBrowserDynamic().bootstrapModule(ChatAppModule);

// --------------------
// You can ignore these 'require' statements. The code will work without them.
// They're currently required to get watch-reloading
// from webpack, but removing them is a TODO
require('./services');
require('./util/util');
require('./components/ChatApp');
require('./components/ChatNavBar');
require('./components/ChatWindow');
require('./components/ChatThreads');

