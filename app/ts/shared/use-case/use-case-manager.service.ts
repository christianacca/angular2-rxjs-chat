import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { UseCaseEventsService } from './use-case-events.service';

export type TeardownLogic = Subscription | Function | void;

export interface AnonymousManagedService {
    (): TeardownLogic | TeardownLogic[];
}

export interface ManagedService {
    start(): TeardownLogic | TeardownLogic[];
}

@Injectable()
export class UseCaseManager {
    private servicesSubscription = new Subscription();
    private stopSubscription = new Subscription();

    constructor(private appEvents: UseCaseEventsService) {
        console.log('UseCaseManager created');
        this.stopSubscription = appEvents.stop$.subscribe(() => {
            this.teardownServices();
        });
    }

    dispose() {
        this.appEvents.stop(); // triggers teardownServices
        this.stopSubscription.unsubscribe();
    }

    /**
     * Supply any service or function that requires some form of cleanup 
     * when the use case is stopped
     * 
     * A typical use case is a service that *itself* subscribes to an
     * rxjs observable that lives on after the use case has stopped
     */
    start(...services: Array<AnonymousManagedService | ManagedService>) {
        _.flatMap(
            services,
            svc => typeof svc === 'function' ? svc() : svc.start()
        ).forEach(
            td => this.servicesSubscription.add(td)
            );
    }

    private teardownServices() {
        this.servicesSubscription.unsubscribe();
        this.servicesSubscription = new Subscription();
    }
}
