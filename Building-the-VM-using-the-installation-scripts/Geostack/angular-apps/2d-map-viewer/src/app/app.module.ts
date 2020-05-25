/*
Here we import basic Angular modules.
The modules will be added to the imports section in this file.
*/
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

/*Here we import the NgbModule which is used to style the application using
bootstrap.*/
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/*Here we import the FormsModule which is used to create Angular forms in
the application(s).*/
import { FormsModule } from '@angular/forms';

/*Here we import the HttpClientModule which is used to make HTTP Requests to
our Flask-API and Tileserver in our services files.*/
import { HttpClientModule } from '@angular/common/http';

/*Here we import the main App component which will be added to the declarations
section in this file.*/
import { AppComponent } from './app.component';

/*Here we import the Sidebar component which will be added to the declarations
section in this file.*/
import { SidebarComponent } from '../app/components/sidebar/sidebar.component';

/*Here we import the navbar component which will be added to the declarations
section in this file.*/
import { NavbarComponent } from '../app/components/navbar/navbar.component';

/*Here we import the base component which is our base page and will be added
to the declarations section in this file.*/
import { BaseComponent } from '../app/pages/base-page/base-page.component';


/*Here we import the map component which is our map page and will be added
to the declarations section in this file.*/
import { MapComponent } from '../app/pages/map-page/map.component';

/*Here we import the DatePickerComponent which is our DTG Picker and will be added
to the declarations section in this file.*/
import { DatePickerComponent } from 'src/app/components/datepicker/datepicker.component';

@NgModule({
  /*
  Below we declare all the components that are going to be used throughout our
  application(s). You have to declare a component before it can be used in the
  application.
  */
  declarations: [
    AppComponent,
    SidebarComponent,
    NavbarComponent,
    BaseComponent,
    MapComponent,
    DatePickerComponent
  ],
  /*
  Below we import al the modules that are going to be used throughout our
  application(s). You have to import a module before it can be referenced in the
  application.
  */
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
