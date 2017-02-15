import { ChatDataset } from './ChatDataset';
import { Observable } from 'rxjs';
import { DtoDataset, EntityDataset } from '../models';
import { UserDataService } from './UserDataService';
import { MessageDataService } from './MessageDataService';
import { ThreadDataService } from './ThreadDataService';
import { Injectable } from '@angular/core';

@Injectable()
export class ChatEntityManager {

    constructor(
        private messageDs: MessageDataService,
        private threadDs: ThreadDataService,
        private userDs: UserDataService) { }

    toEntities({messagesData, threadsData, usersData}: DtoDataset): ChatDataset {

        // note: breezejs would be doing this work of rehydrating the raw data into
        // a connected object graph

        const users = usersData.map(u => this.userDs.toEntity(u));
        const threads = threadsData.map(t => this.threadDs.toEntity(t, { users }));
        const messages = messagesData.map(m => this.messageDs.toEntity(m, { users, threads }));
        return new ChatDataset({ messages, threads, users });
    }

    save({ messages = [], threads = [], users = []}: Partial<EntityDataset>): Promise<EntityDataset> {

        const ds = new ChatDataset({ messages, threads, users});

        const userSavesRequests = Observable.forkJoin(
            ds.users.map(u => this.userDs.save(u))
        );
        const threadSaveRequests = Observable.forkJoin(
            ds.threads.map(t => this.threadDs.save(t))
        );
        const messageSavesRequests = Observable.forkJoin(
            ds.messages.map(m => this.messageDs.save(m))
        );

        return userSavesRequests.switchMap(savedUsers => {
            return Observable.forkJoin(
                Observable.of(savedUsers),
                threadSaveRequests
            );
        }).switchMap(([savedUsers, savedThreads]) => {
            return Observable.forkJoin(
                Observable.of(savedUsers),
                Observable.of(savedThreads),
                messageSavesRequests
            );
        }).map(([savedUsers, savedThreads, savedMessages]) => {
            return {
                messages: savedMessages,
                threads: savedThreads,
                users: savedUsers
            };
        }).toPromise();
    }

    async save2({ messages = [], threads = [], users = []}: Partial<EntityDataset>): Promise<EntityDataset> {

        const ds = new ChatDataset({ messages, threads, users});

        const savedUsers = await Promise.all(
            ds.users.map(u => this.userDs.save(u).toPromise())
        );
        const savedThreads = await Promise.all(
            ds.threads.map(t => this.threadDs.save(t).toPromise())
        );
        const savedMessages = await Promise.all(
            ds.messages.map(m => this.messageDs.save(m).toPromise())
        );

        return {
            messages: savedMessages,
            threads: savedThreads,
            users: savedUsers
        };
    }
}
