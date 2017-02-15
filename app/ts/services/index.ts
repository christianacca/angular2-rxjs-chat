import { ChatEntityManager } from './ChatEntityManager';
import { ChatAppDataGateway } from './ChatAppDataGateway';
import { UserDataService } from './UserDataService';
import { MessageDataService } from './MessageDataService';
import { ThreadDataService } from './ThreadDataService';
import {messagesServiceInjectables} from './MessagesService';
import {threadsServiceInjectables} from './ThreadsService';
import {userServiceInjectables} from './UserService';
import { ChatExampleBots } from './ChatExampleBots';

export * from './MessagesService';
export * from './ThreadsService';
export * from './UserService';
export * from './UserDataService';
export * from './MessageDataService';
export * from './ThreadDataService';
export * from './ChatEntityManager';
export { ChatExampleBots }

export var servicesInjectables: Array<any> = [
  messagesServiceInjectables,
  threadsServiceInjectables,
  userServiceInjectables,
  ChatExampleBots,
  ChatAppDataGateway,
  ChatEntityManager
];

export let dataServicesInjectables = [UserDataService, MessageDataService, ThreadDataService];
