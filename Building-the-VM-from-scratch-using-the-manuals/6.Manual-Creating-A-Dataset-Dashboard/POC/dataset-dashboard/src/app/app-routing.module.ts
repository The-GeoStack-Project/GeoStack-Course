/*
Here we import the default angular modules
*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/*Here we import the base component which is required to create a new
Angular route for our base page.*/
import { BaseComponent } from '../app/pages/base-page/base-page.component';

/*Here we import the GPSDashboard component which is required to create a new
Angular route for our Dashboard.*/
import { GPSDashboard } from '../app/pages/gpsdashboard/gpsdashboard.component';


/*
Below we add the route of our base page to the angular routes list. We do this
by adding the following line to the list:
{ path: 'base-page', component: BaseComponent},

Below we also add the route of our base page to the angular routes list.
We do this by adding the following line to the list:
{ path: 'gpsdashboard', component: GPSDashboard},

This means that when we navigate to localhost:4200/base-page, the BaseComponent
will be loaded and thus our base-page.

Now we want to make sure that when we navigate to localhost:4200, we are
automatically redirected to the Dashboard page. For this we add the following
line to the routes list:
  { path: '', redirectTo: 'gpsdashboard', pathMatch: 'full',},

This means that when we navigate to localhost:4200, we are redirected to value
assigned to the redirectTo variable, which is gpsdashboard in this case.
So when we are redirected to the gpsdashboard the Dashboard is shown.*/
const routes: Routes = [
  { path: 'gpsdashboard', component: GPSDashboard},
  { path: 'base-page', component: BaseComponent},
  { path: '', redirectTo: 'gpsdashboard', pathMatch: 'full',},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
