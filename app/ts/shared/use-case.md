## use-case shared feature

### Purpose

To provide a logical grouping of UI components that can be recycled on demand. Recycling thus resets any state that these 
components and the services they provide might have accumulated.

### Why?

In practice feature areas are decomposed into multiple UI components. In some cases, features mights in turn be split into 
sub-features, each implementing a step in a larger orchestrated workflow.

Often the components in these features build up state. As state accumulates, the more risk there is of unforseen interactions 
and behaviours. This increases complexity and the likelihood of a bug.

When a bug occurs, an application should have a clean way of resetting it's state back to a known position. The easiest way 
to do that is to throw away the set of existing UI components that have produced the fault and recreate them.

Even in the absence of state, it might be useful to restart a workflow. Again the easiest way is often to throw away all 
existing components in that workflow and recreating them at their starting poisitions.

### Mechanics

1. Identitfy the component (or components in a larger workflow), that maintain state that needs to be recycled
2. Decorate the component element with the `use-case-content`
    * EG: `<your-component *use-case-content></your-component>`
3. Decorate an ancestor component with `use-case`
    * EG: `<ng-container use-case>...</ng-container>`
4. Add a component somewhere below in the component tree below the component decorated with `use-case`
    * This component will call `UseCaseEventsService.restart` method, causing `your-component` to be recycled
    * An example component that can be used immediately: `use-case-ctrl-buttons`

### Example 1

Your application has a `stock-ticker` component that appears in the main navigation bar of the application. It's displaying latest
trades of a financial stock. It maintain's this data as a property on it's component class.

`stock-ticker` is clearly a long lived component that maintains state. 

What if `stock-ticker` fails due to an unhandled exception after polling for stock data. And this failure causes the component 
to no longer be able to update. Or worse, continues to produce an exception on every polling interval.

Typcially the user of your application will need to close the browser tab and restart the application in order to reset the
component back to a functional state.

Instead you've decorated `stock-ticker` with the `use-case-content` directive (with a component further in
the component tree decorated with the `use-case` directive).

Your application also conditionally displays `use-case-ctrl-buttons` on an error's being detected in the application. 
The user clicks on the restart button. This case the `UseCaseEventsService` to emit a restart event. `use-case-content`
has subscribed to this event, and responds by destroying the current `stock-ticker` and reinstantiating a replacement
instance to take it's place.

### Example 2

`ChatApp`. See: [Diagram](use-case.png)