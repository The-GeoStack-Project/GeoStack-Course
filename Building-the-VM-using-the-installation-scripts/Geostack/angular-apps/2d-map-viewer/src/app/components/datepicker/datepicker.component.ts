// Here we import the required modules.
import {
    Component,
    OnInit,
    Input,
    EventEmitter,
    OnChanges,
    Output
} from '@angular/core';

import {
    NgbModal,
    ModalDismissReasons,
    NgbDate,
    NgbCalendar
} from '@ng-bootstrap/ng-bootstrap';

/*
Here we define the component metadata. The following applies to the code below:
- The selector is going to be: "dtgpicker", so when we want to use this
  component we use the syntax <dtgpicker/> in an HTML page to which we want
  to add this component.
- The templateUrl is going to be: './datepicker.component.html', this HTML page
  contains the layout of the datepicker component.
*/
@Component({
    selector: 'dtgpicker',
    templateUrl: './datepicker.component.html'
})

// Here we create the datepicker component class
export class DatePickerComponent implements OnInit {

  // Here we tell the DatePickerComponent to expect an input.
  // This input will be the start and enddate of the route that is currently
  // visualized.
  @Input() dateRange : any;

  // Here we tell the DateTimePicker component to output a dateEvent of type
  // EventEmitter which needs to be of type NgbDate (The date format created
  // by the NgbCalendar).
  @Output() dateEvent = new EventEmitter<NgbDate[]>()

  // Here we define 2 global variables which are used to set the start and
  // end dates of the NgbCalendar.
  public startDate: NgbDate;
  public endDate: NgbDate;

  // Here we create the datepicker constructor. We pass an instance
  // of an NgbModal, used to create a dropdown, and an NgbCalendar, which is
  // used to create the calendar, in the constructor.
  constructor(private modalService: NgbModal, calendar: NgbCalendar) {}

  /*
	Here we create the ngOnInit() function. All the logic in this function will
	be executed when the component is loaded.
	*/
  ngOnInit() {
    this.setDateRange(this.dateRange)
  };

  /*
	Here we create the ngOnChanges() function. All the logic in this function will
	be executed when the component is updated / changed.
	*/
  ngOnChanges(): void {
    this.setDateRange(this.dateRange)
  };

  // Here we create a function called:"open()".
  // This function is triggered when the input form(s) is clicked in the HTML
  // page.
  open(content, type, modalDimension) {
      if (modalDimension === 'sm' && type === 'modal_mini') {
          this.modalService.open(content, {
              windowClass: 'modal-mini',
              size: 'sm',
              centered: true
          });
      }
  };

  /*
   Here we create a function called: "setDateRange()" which will take a list
   (containing a startDate at index 0 and an EndDate at index 1) as input parameter.

   This function is triggerd in the following functions:

   1) ngOnInit(), to make sure the dateRange is set when the component is
      loaded for the first time.

   2) ngOnChanges(), to make sure the dateRange is set when the component
      data is updated.

   The following steps are executed when the function is triggered:

   1) Extract and transform the startDate from the list passed on the
      function call.

   2) Transform the extracted date (from the previous step) into a valid
      NgbDate format and assign it to the global variable:"startDate".

   3) Extract and transform the endDate from the list passed on the
      function call.

   4) Transform the extracted date (from the previous step) into a valid
      NgbDate format and assign it to the global variable:"endDate".
  */
  setDateRange(date){

      // Here we extract and transform the startDate.
      let startDate = new Date(date[0]);

      // Here we transform the startDate to a valid format.
      this.startDate = new NgbDate(startDate.getFullYear(),startDate.getMonth()+1,startDate.getDate());

      // Here we extract and transform the endDate.
      let endDate = new Date(date[1]);

      // Here we transform the endDate to a valid format.
      this.endDate = new NgbDate(endDate.getFullYear(),endDate.getMonth()+1,endDate.getDate());
  };

  // Here we create a function which is used to check whether the input
  // startDate is not lower than the startDate of the selected item.
  isRangeStart(date: NgbDate) {
      return this.startDate && this.endDate && date.equals(this.startDate);
  };

  // Here we create a function which is used to check whether the input
  // endDate is not higher than the endDate of the selected item.
  isRangeEnd(date: NgbDate) {
      return this.startDate && this.endDate && date.equals(this.endDate);
  };

  // Here we create a function to check which date is currently selected.
  // The value returned by this function will be marked with a blue Circle
  // in the NgbCalendar so that the user knows which date is currently selected.
  isActive(date: NgbDate) {
      return date.equals(this.startDate) || date.equals(this.endDate);
  }

  // Here we create a function which checks if the selected end date is not
  // lower than the selected start date. If this is the case the start date
  // will automatically be set to the endDate.
  endDateChanged(date) {
      if (this.startDate && this.endDate && (this.startDate.year > this.endDate.year
        || this.startDate.year === this.endDate.year && this.startDate.month > this.endDate.month
        || this.startDate.year === this.endDate.year && this.startDate.month === this.endDate.month
        && this.startDate.day > this.endDate.day)) {
          this.startDate = this.endDate;
      }
  };

  // Here we create a function which checks if the selected startDate is not
  // higher than the selected endDate. If this is the case the endDate
  // will automatically be set to the startDate.
  startDateChanged(date) {
      if (this.startDate && this.endDate && (this.startDate.year > this.endDate.year
        || this.startDate.year === this.endDate.year && this.startDate.month > this.endDate.month
        || this.startDate.year === this.endDate.year && this.startDate.month === this.endDate.month
        && this.startDate.day > this.endDate.day)) {
          this.endDate = this.startDate;
      }
  };

}



export class DatePickerComponent implements OnInit {

    // Here we tell the DatePickerComponent to expect an input.
    // This input will be the start and enddate of the route that is currently
    // visualized.
    @Input() dateRange : any;


    // Here we tell the DateTimePicker component to output a dateEvent of type
    // EventEmitter which needs to be of type NgbDate (The date format created
    // by the NgbCalendar).
    @Output() dateEvent = new EventEmitter<NgbDate[]>()

    // Here we define 2 global variables which are used to set the start and
    // end dates of the NgbCalendar.
    public startDate: NgbDate;
    public endDate: NgbDate;


    ngOnInit() {
        this.setDateRange(this.dateRange)
    }

    ngOnChanges(): void {
        this.setDateRange(this.dateRange)
    }


    /*
     Here we create a function called: "setDateRange()" which will take a list
     (containing a startDate at index 0 and an EndDate at index 1) as input parameter.

     This function is triggerd in the following functions:

     1) ngOnInit(), to make sure the dateRange is set when the component is
        loaded for the first time.

     2) ngOnChanges(), to make sure the dateRange is set when the component
        data is updated.

     The following steps are executed when the function is triggered:

     1) Extract and transform the startDate from the list passed on the
        function call.

     2) Transform the extracted date (from the previous step) into a valid
        NgbDate format and assign it to the global variable:"startDate".

     3) Extract and transform the endDate from the list passed on the
        function call.

     4) Transform the extracted date (from the previous step) into a valid
        NgbDate format and assign it to the global variable:"endDate".
    */
    setDateRange(date){

        // Here we extract and transform the startDate.
        let startDate = new Date(date[0]);

        // Here we transform the startDate to a valid format.
        this.startDate = new NgbDate(startDate.getFullYear(),startDate.getMonth()+1,startDate.getDate());

        // Here we extract and transform the endDate.
        let endDate = new Date(date[1]);

        // Here we transform the endDate to a valid format.
        this.endDate = new NgbDate(endDate.getFullYear(),endDate.getMonth()+1,endDate.getDate());
    }

    open(content, type, modalDimension) {
        if (modalDimension === 'sm' && type === 'modal_mini') {
            this.modalService.open(content, {
                windowClass: 'modal-mini',
                size: 'sm',
                centered: true
            });
        }
    }


    // Here we create a function which is used to check whether the input
    // startDate is not lower than the startDate of the selected item.
    isRangeStart(date: NgbDate) {
        return this.startDate && this.endDate && date.equals(this.startDate);
    }

    // Here we create a function which is used to check whether the input
    // endDate is not higher than the endDate of the selected item.
    isRangeEnd(date: NgbDate) {
        return this.startDate && this.endDate && date.equals(this.endDate);
    }

    // Here we create a function which is used to check whether the selected
    // dates is inbetween the start and end dates.
    isInRange(date: NgbDate) {
        return date.after(this.startDate) && date.before(this.endDate);
    }

    // Here we create a function to check which date is currently selected.
    // The value returned by this function will be marked with a blue Circle
    // in the NgbCalendar so that the user knows which date is currently selected.
    isActive(date: NgbDate) {
        return date.equals(this.startDate) || date.equals(this.endDate);
    }

    // Here we create a function which checks if the selected end date is not
    // lower than the selected start date. If this is the case the start date
    // will automatically be set to the endDate.
    endDateChanged(date) {
        if (this.startDate && this.endDate && (this.startDate.year > this.endDate.year
          || this.startDate.year === this.endDate.year && this.startDate.month > this.endDate.month
          || this.startDate.year === this.endDate.year && this.startDate.month === this.endDate.month
          && this.startDate.day > this.endDate.day)) {
            this.startDate = this.endDate;
        }
    };

    // Here we create a function which checks if the selected startDate is not
    // higher than the selected endDate. If this is the case the endDate
    // will automatically be set to the startDate.
    startDateChanged(date) {
        if (this.startDate && this.endDate && (this.startDate.year > this.endDate.year
          || this.startDate.year === this.endDate.year && this.startDate.month > this.endDate.month
          || this.startDate.year === this.endDate.year && this.startDate.month === this.endDate.month
          && this.startDate.day > this.endDate.day)) {
            this.endDate = this.startDate;
        }
    };


    // Here we create the function which is used to send the selected
    // start and endDate to the MapComponent which will then use these values
    // to select all the datapoints in a cetain timeframe. 
    sendDTG() {
        this.dateEvent.emit([this.startDate,this.endDate])
    };

}
