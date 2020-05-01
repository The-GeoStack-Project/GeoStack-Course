/*
Here we import the default angular modules
*/
import { Component } from '@angular/core';

/*
Here we create the component metadata. The following applies to this code:
  1) selector: If we want to use the app (main) component, we add the code:
     <app-root/> to the HTML file in which we want to add the component.
  2) templateUrl: The HTML file in which we will define the layout of the
     component.
*/
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

/*
Create the class of the Main app component. The only thing we are going to
add is a global variable called title. This is the title that the
application will get.
*/
export class AppComponent {
  title = 'base-application';
}
