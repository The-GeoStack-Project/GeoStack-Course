/*Import basic Angular modules.*/
import { Component, OnInit } from '@angular/core';

/*
Here we create an interface which defines what attributes a route is going to
have. When we add a new route to our sidebar, the route needs to have the
attributes defined in the interface.
The following applies to this interface:
  - Path:   The path to which will be navigated when the sidebar entry is
            clicked.
  - title:  The title which the entry and the page wil have.
  - icon:   The entry icon which will show in the sidebar.
  - class:  If any classes need to be passed with this route, they can be
            passed in this value. A class can be used to set specific styling
            to a sidebar entry.
*/
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

/*
Here we create a list which contains all the routes that will be displayed in
our sidebar. The list items inherit the interface: "RouteInfo".

Since we are only going to add the route of our base page, we only need to
create one route. The following applies to this route:
- Path:   The base page component is located on the path:"/base-page"
- title:  The title of the base page is going to be: "Base Page"
- icon:   The entry icon will be the map icon provided by the package:
          "Material Icons". If you want to add other icons you can navigate to
          the following URL:"https://material.io/resources/icons/?style=baseline"
- class:  No extra classes need to be passed in this route.
*/
export const ROUTES: RouteInfo[] = [
    { path: '/map-page', title: '3D Map Cesium', icon: 'map', class: '' },
    { path: '/base-page', title: 'Base Page', icon: 'map', class: '' },
];

/*
Here we define the component metadata. The following applies to the code below:
- The selector is going to be: "app-sidebar", so when we want to use this
  component we use the syntax <app-sidebar/> in an HTML page to which we want
  to add this component.
- The templateUrl is going to be: './sidebar.component.html', this HTML page
  contains the layout of the sidebar component.
*/
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})

/*
Here we define the SidebarComponent class. This class is going to be relatively
simple. The only functionality the SidebarComponent has, is that it has to show
the available routes and highlight a route/entry when it's active.
*/
export class SidebarComponent implements OnInit {

  /*
  Here we create an empty list called menuItems. This list will be populated
  with all the routes defined at line 37.
  */
  menuItems: any[];

  /*
  Here we create a constructor which is going to be empty since we don't
  need to instantiate anything in this component.
  */
  constructor() { }

  /*
  Here we create the function that's triggered when the component is loaded.
  In this function we define the code which will populate the empty menuItems
  list with all the routes defined in line 37.
  */
  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
}
