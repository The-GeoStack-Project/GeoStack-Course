/*
Here we import the default angular modules
*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/*Here we import the base component which is required to create a new
Angular route.*/
import { BaseComponent } from '../app/pages/base-page/base-page.component';

/*

Below we add the route of our base page to the angular routes list. We do this
by adding the following line to the list:
{ path: 'base-page', component: BaseComponent},

This means that when we navigate to localhost:4200/base-page, the BaseComponent
will be loaded and thus our base-page.

Now we want to make sure that when we navigate to localhost:4200, we are
automatically redirected to the base-page.  For this we add the following
line to the routes list:
{ path: '', redirectTo: 'base-page', pathMatch: 'full',},

This means that when we navigate to localhost:4200, we are redirected to value
assigned to the redirectTo variable, which is base-page in this case.
So when we are redirected to the base-page the BaseComponent is shown.*/
const routes: Routes = [
  { path: 'base-page', component: BaseComponent},
  { path: '', redirectTo: 'base-page', pathMatch: 'full',},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
