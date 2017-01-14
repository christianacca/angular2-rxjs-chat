import { Directive, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';

import { Subscription } from 'rxjs';
import { UseCaseEventsService } from './use-case-events.service';

@Directive({
    selector: '[use-case-content]'
})
export class UseCaseContentDirective implements OnDestroy {
    private subs: Subscription;
    
    constructor(
        templateRef: TemplateRef<any>,
        viewContainerRef: ViewContainerRef,
        appEvents: UseCaseEventsService) {

        viewContainerRef.createEmbeddedView(templateRef);
        this.subs = appEvents.reset$.subscribe(() => {
            viewContainerRef.clear();
            viewContainerRef.createEmbeddedView(templateRef);
        });
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
