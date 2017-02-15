import { DataServiceBase, Metadata } from './DataServiceBase';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { EntityDataset, Thread } from '../models';

@Injectable()
export class ThreadDataService extends DataServiceBase<Thread> {
    private static metadata: Metadata<Thread> = {};
    constructor(http: Http) {
        super('threads', http, ThreadDataService.metadata);
    }

    toDto<K extends keyof Thread>(entity: Thread, customNavigationProps: K[] = []): Partial<Thread> {
        return super.toDto(entity, ['lastMessage']);
    }

    toEntity(
        data: Partial<Thread>,
        dataset: Partial<EntityDataset>): Thread {
        const thread = Object.assign(new Thread(), data) as Thread;
        thread.setNavigationProperties(dataset);
        return thread;
    }
}
