import { Component } from '@angular/core';
import { UseCaseEventsService } from './use-case-events.service';

@Component({
    selector: 'use-case-ctrl-buttons',
    template: `
    <button class="btn btn-default" type="button" 
        (click)="appEvents.stop()" [disabled]="!appEvents.isRunning">Stop</button>
    <button class="btn btn-default" type="button" 
        (click)="appEvents.reset()">Reset</button>
    `,
    host: {
        'class': 'btn-group',
        '[attr.role]': '"group"'
    }
})
export class UseCaseCtrlButtonsComponent {
    constructor(private appEvents: UseCaseEventsService) {}
}
