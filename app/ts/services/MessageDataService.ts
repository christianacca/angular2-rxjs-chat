import { DataServiceBase, Metadata } from './DataServiceBase';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { EntityDataset, Message } from '../models';

@Injectable()
export class MessageDataService extends DataServiceBase<Message> {
    private static metadata:  Metadata<Message> = {
        dateProperties: ['sentAt']
    };
    constructor(http: Http) {
        super('messages', http, MessageDataService.metadata);
    }

    toEntity(
        data: Partial<Message>,
        datasets: Partial<EntityDataset>): Message {
        const message = Object.assign(new Message(), data) as Message;
        message.setNavigationProperties(datasets);
        return message;
    }
}
