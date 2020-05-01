/*
Here we import the default angular modules
*/
import { Component, OnInit} from '@angular/core';


/*
Here we create the component metadata. The following applies to this code:
  1) selector: If we want to use the base page Component, we add the code:
     <app-base/> to the HTML file in which we want to add the component.
  2) templateUrl: The HTML file in which we will define the layout of the
     component.
*/
@Component({
  selector: 'app-base',
  templateUrl: './base-page.component.html',
})

/*
Below we create the class of the Base Component.

We add a constructor and the function ngOnInit() which are both empty since
the base page doesn't have any functionality but is created just for learning
purposes.
*/
export class BaseComponent implements OnInit {

    constructor() {
    }

    ngOnInit(){
    }
}
