/*Below we import the modules required for the navbar to function propperly.*/
import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

/*
Here we create the component metadata. The following applies to this code:
  1) selector: If we want to use the navbar component, we add the code:
     <app-navbar/> to the HTML file in which we want to add the component.
  2) templateUrl: The HTML file in which we will define the layout of the
     component.
*/
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})

/*
Below we create the class of the navbar component. We add a constructor and the
function ngOnInit().
*/
export class NavbarComponent implements OnInit {

    /* Here we create a global variable called: "listTitles". The list assigned
    to this variable will be empty in the beginning but will be filled with the
    titles of all the entries in the ROUTES list defined in our sidebar
    component.*/
    private listTitles: any[];

    /* Here we create a global variable called: "location".
    The active location (page0 will be assigned tto this variable.*/
    location: Location;

    /* Here we create a global variable called: "toggleButton".
    The HTML element representing the toggleButton which is defined in the
    HTML.component file will be assigned to this variable.*/
    private toggleButton: any;

    /* Here we create a global variable called: "sidebarVisible".
    The value of this variable is either true of false. When the sidebar is open
    the value of this variable will be true. When the sidebar is closed the
    value of this variable will be false.*/
    private sidebarVisible: boolean;

    /* Here we create the class constructor.
    We pass the location, an instance of an ElementReference and the Angular
    router as parameters in the constructor.
    The current location (page) is than assigned to the global variable location
    and the value of sidebarVisible is set to false.  */
    constructor(
      location: Location,  private element: ElementRef, private router: Router){

      this.location = location;

      this.sidebarVisible = false;
    }

    /* Here we create the ngOnInit() function.
    We assign all the listTitles of the ROUTES list in the sidebar.component.ts
    file to the global variable:"listTitles" using the build in JavaScript
    function: ".filter()"*/
    ngOnInit(){
      // Here we assign all the titles in the ROUTES list to the listTitles.
      this.listTitles = ROUTES.filter(listTitle => listTitle);
      // Here we assign an nativeElement tot a variable navbar.
      const navbar: HTMLElement = this.element.nativeElement;

      // Here we assign the element with class navbar-toggler to the variable
      // togglebutton. This is our toggleButton in our navbar layout file.
      this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];

      // Here we create the logic which is executed when the sidebar is toggled.
      // The function sidebarClose() is called and the layer which makes the
      // screen dark is removed.
      this.router.events.subscribe((event) => {
        this.sidebarClose();
         var $layer: any = document.getElementsByClassName('close-layer')[0];
         if ($layer) {
           $layer.remove();
         }
     });
    }

    /* Here we create a function called: 'sidebarOpen()'
    This function contains the logic which is executed when the toggleButton is
    clicked and the sidebar opens.*/
    sidebarOpen() {
        // Here we assign the value of the global toggleButton to a constant
        // called toggleButton.
        const toggleButton = this.toggleButton;

        // Here we assign the HTML body element of the webapplication to a
        // constant called body.
        const body = document.getElementsByTagName('body')[0];

        // Here we add a timeout function which is executed after 500 miliseconds.
        // This function adds the class: "toggled" to the toggleButton.
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);

        // The class nav-open is added to the body. When this class is added
        // the body get's an overlay which makes the content of the body dark.
        body.classList.add('nav-open');

        // We set the global variable: "sidebarVisible" to true.
        this.sidebarVisible = true;
    };

    /* Here we create a function called: 'sidebarClose()'
    This function contains the logic which is executed when the toggleButton is
    clicked and the sidebar closes.*/
    sidebarClose() {

        // Here we assign the HTML body element of the webapplication to a
        // constant called body.
        const body = document.getElementsByTagName('body')[0];

        // Here we remove the class: "toggled" from the toggleButton element.
        this.toggleButton.classList.remove('toggled');
        body.classList.add('nav-open');

        // We set the global variable: "sidebarVisible" to true.
        this.sidebarVisible = false;

        // The class nav-open is removed from the body. When this class is
        // removed the dark overlay which makes the content of the body is
        // removed.
        body.classList.remove('nav-open');
    };

    sidebarToggle() {
        // Here we assign the element with class navbar-toggler to the variable
        // togglebutton. This is our toggleButton in our navbar layout file.
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        // Here we add a check whether sidebar is toggled or not.
        // When it's not toggled the function: "sidebarOpen()" is triggered.
        // When it's toggled the function: "sidebarClosed()" is triggered.
        if (this.sidebarVisible === false) {
          this.sidebarOpen();
        } else {
          this.sidebarClose();
        }

        // Here we assign the HTML body element of the webapplication to a
        // constant called body.
        const body = document.getElementsByTagName('body')[0];

        // Here we add a timeout function which is executed after 500 miliseconds.
        // This function adds the class: "toggled" to the toggleButton.
        setTimeout(function() {
          $toggle.classList.add('toggled');
        }, 430);

        // Here we create a new HTML div element and assign the class:
        // "close-layer" to it.
        var $layer = document.createElement('div');
        $layer.setAttribute('class', 'close-layer');

        // Below we add the code that makes sure that the layer is added to
        // the correct div element.
        if (body.querySelectorAll('.main-panel')) {
          document.getElementsByClassName('main-panel')[0].appendChild($layer);
        }else if (body.classList.contains('off-canvas-sidebar')) {
          document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
        }

        // Here we add a timeout function which is executed after 100 miliseconds.
        // This function adds the class:"visible" to the newly created div .
        setTimeout(function() {
          $layer.classList.add('visible');
        }, 100);

        // The function below makes sure that when the sidebar is open and thus
        // a dark overlay is created and we click on the overlay, the sidebar
        // is closed en the overlay is removed.
        $layer.onclick = function() {
          body.classList.remove('nav-open');
          this.mobile_menu_visible = 0;
          $layer.classList.remove('visible');
          setTimeout(function() {
              $layer.remove();
              $toggle.classList.remove('toggled');
          }, 400);
        }.bind(this);

        body.classList.add('nav-open');
    };

    // Below we create the function: "getTitle()" which obtains the title
    // of the active path(page) and passes the title to the layout.html page.
    // If no title is available we pass the default title: "Dashboard".
    getTitle(){
      var titlee = this.location.prepareExternalUrl(this.location.path());

      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }

      for(var item = 0; item < this.listTitles.length; item++){
          if(this.listTitles[item].path === titlee){
              return this.listTitles[item].title;
          }
      }
      return 'Dashboard';
    }
}
