import { Directive, OnDestroy } from '@angular/core';

import { UseCaseEventsService } from './use-case-events.service';
import { UseCaseManager } from './use-case-manager.service';

@Directive({
    selector: 'use-case, [use-case]',
    providers: [UseCaseEventsService, UseCaseManager]
})
export class UseCaseDirective implements OnDestroy {
    
    constructor(public useCaseManager: UseCaseManager) {
        console.log('UseCaseComponent created');
    }

    ngOnDestroy() {
        // ensures any cleanup is run when the component at the root
        // of a use-case is removed from the DOM

        console.log('UseCaseComponent destroyed');
        this.useCaseManager.dispose();
    }
}
