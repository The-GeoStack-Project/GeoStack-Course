/*
Here we import the default angular modules
*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/*Here we import the base component which is required to create a new
Angular route.*/
import { BaseComponent } from '../app/pages/base-page/base-page.component';


/*Here we import the map component which is required to create a new
Angular route for the map page.*/
import { MapComponent } from '../app/pages/map-page/map.component';

/*
Below we add the route of our base page to the angular routes list. We do this
by adding the following line to the list:
{ path: 'base-page', component: BaseComponent},

Below we also add the route of our base page to the angular routes list.
We do this by adding the following line to the list:
  { path: 'map-page', component: MapComponent}

This means that when we navigate to localhost:4200/map-page, the MapComponent
will be loaded and thus our map-page.

Now we want to make sure that when we navigate to localhost:4200, we are
automatically redirected to the Map page. For this we add the following
line to the routes list:
  { path: '', redirectTo: 'map-page', pathMatch: 'full',},

This means that when we navigate to localhost:4200, we are redirected to value
assigned to the redirectTo variable, which is the map-page in this case.
So when we are redirected to the map-page the MapComponent is shown.*/
const routes: Routes = [
  { path: 'base-page', component: BaseComponent},
  { path: '', redirectTo: 'map-page', pathMatch: 'full',},
  { path: 'map-page', component: MapComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
