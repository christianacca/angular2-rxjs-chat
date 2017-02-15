import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable()
export class UseCaseEventsService {
    reset$: Observable<any>;
    stop$: Observable<Date>;
    isRunning = true;
    private resetSubject$ = new Subject<any>();
    private stopSubject$ = new Subject<Date>();
    constructor() {
        this.reset$ = this.resetSubject$.asObservable();
        this.stop$ = this.stopSubject$.asObservable();
    }

    reset() {
        if (this.isRunning) {
            this.stop();
        }

        console.log('reset');
        this.isRunning = true;
        this.resetSubject$.next(null);
    }
    stop() {
        if (!this.isRunning) { return; }
        
        console.log('stop');
        this.isRunning = false;
        this.stopSubject$.next(new Date());
    }
}
