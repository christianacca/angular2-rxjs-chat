import { NgModule } from '@angular/core';
import { UseCaseContentDirective } from './use-case-content.directive';
import { UseCaseCtrlButtonsComponent } from './use-case-ctrl-buttons.component';
import { UseCaseDirective } from './use-case.directive';

export * from './use-case-events.service';
export * from './use-case-manager.service';

const USE_CASE_DIRECTIVES = [
    UseCaseCtrlButtonsComponent,
    UseCaseDirective,
    UseCaseContentDirective
];

@NgModule({
    declarations: USE_CASE_DIRECTIVES,
    exports: USE_CASE_DIRECTIVES
})
export class UseCaseModule {}
