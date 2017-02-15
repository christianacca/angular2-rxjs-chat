import { ChatDataset } from './ChatDataset';
import { ChatEntityManager } from './ChatEntityManager';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Observable, ConnectableObservable } from 'rxjs';
import { UserDataService } from './UserDataService';
import { ThreadDataService } from './ThreadDataService';
import { MessageDataService } from './MessageDataService';
import { EntityDataset } from '../models';
import { Injectable } from '@angular/core';
import '../util/poll-operator';



@Injectable()
export class ChatAppDataGateway {

    db$: Observable<EntityDataset>;
    private hotObservables: ConnectableObservable<any>[] = [];

    constructor(
        private messageDs: MessageDataService,
        private threadDs: ThreadDataService,
        private userDs: UserDataService,
        private chatEntityManager: ChatEntityManager) {
        const db$ = this._db$();
        this.hotObservables.push(db$);
        this.db$ = db$;
    }

    start() {
        // calling connect, our observer chains will recieve 
        // emissions even if no one subscribes.
        // ie we're making observables "hot"
        return this.hotObservables.map(o => o.connect());
    }

    private getDataset(date: Date) {
        const datasetRequest =
            this.messageDs.getByCreatedOnAfter(date)
                .mergeMap(messages => {
                    const referencedThreadIds = messages.map(m => m.threadId);
                    return Observable.forkJoin(
                        Observable.of(messages),
                        this.threadDs.getByIds(referencedThreadIds)
                    );
                })
                .mergeMap(([messages, threads]) => {
                    const referencedUserIds = messages
                        .map(m => m.authorId)
                        .concat(threads.map(m => m.startedById));
                    return Observable.forkJoin(
                        Observable.of(messages),
                        Observable.of(threads),
                        this.userDs.getByIds(referencedUserIds)
                    );
                });

        return datasetRequest
            .filter(ds => ds.some(arr => arr.length > 0))
            .map(([messagesData, threadsData, usersData]) => {
                return this.chatEntityManager.toEntities({ messagesData, threadsData, usersData });
            });
    }

    private _db$() {
        const startingAt = moment().subtract(10, 'days').toDate();
        return Observable.interval(2000)
            .startWith(-1)
            .mergeScan(({ snapshot }) => {
                return this.getDataset(snapshot).map(dataset => {
                    const nextSnapshot = _.maxBy(dataset.messages, 'createdOn').createdOn;
                    return {
                        snapshot: nextSnapshot,
                        dataset
                    };
                });
            }, { snapshot: startingAt, dataset: null as ChatDataset }, 1)
            .map(x => x.dataset)
            .scan((prev, curr) => {
                return ChatDataset.merge(prev, curr);
            })
            .publishReplay(1);
    }
}
