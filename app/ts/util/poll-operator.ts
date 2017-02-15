/* tslint:disable:no-unused-variable */
import { Observable } from 'rxjs';

declare module 'rxjs/Observable' {
    namespace Observable {
        let poll: <T>(interval: number, work: (date: Date) => Observable<T>, initialDate?: Date) => Observable<T>;
    }
}

Observable.poll = <T>(interval: number, work: (date: Date) => Observable<T>, initialDate?: Date): Observable<T> => {
    const state = {
        snapshot: initialDate || new Date()
    };
    return Observable.interval(interval)
        .mapTo(state)
        .startWith(state)
        .exhaustMap((x, idx) => {
            const { snapshot } = x;
            const nextSnapshot = new Date();
            return work(snapshot).do(() => {
                x.snapshot = nextSnapshot;
            });
        });
};

