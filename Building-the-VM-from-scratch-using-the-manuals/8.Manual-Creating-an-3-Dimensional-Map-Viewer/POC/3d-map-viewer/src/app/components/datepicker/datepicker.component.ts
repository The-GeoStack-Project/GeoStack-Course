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




@Component({
    selector: 'dtgpicker',
    templateUrl: './datepicker.component.html',
    providers: [],
})

export class DatePickerComponent implements OnInit {


    @Output() dateEvent = new EventEmitter<NgbDate[]>()
    @Input() dateRange : any;


    private startDate: NgbDate;
    private endDate: NgbDate;


    constructor(
        private modalService: NgbModal, calendar: NgbCalendar
    ) {
    }

    ngOnInit() {
        this.setDateRange(this.dateRange)
    }

    ngOnChanges(): void {
        this.setDateRange(this.dateRange)
    }

    // # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    // #                              DTG PICKER RELATED                             #
    // # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #


    setDateRange(date){
        let startDate = new Date(date[0]);
        this.startDate = new NgbDate(startDate.getFullYear(),startDate.getMonth()+1,startDate.getDate()-1);
        let endDate = new Date(date[1]);
        this.endDate = new NgbDate(endDate.getFullYear(),endDate.getMonth()+1,endDate.getDate()+1);
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


    isRangeStart(date: NgbDate) {
        return this.startDate && this.endDate && date.equals(this.startDate);
    }
    isRangeEnd(date: NgbDate) {
        return this.startDate && this.endDate && date.equals(this.endDate);
    }

    isInRange(date: NgbDate) {
        return date.after(this.startDate) && date.before(this.endDate);
    }
    isActive(date: NgbDate) {
        return date.equals(this.startDate) || date.equals(this.endDate);
    }

    endDateChanged(date) {
        if (this.startDate && this.endDate && (this.startDate.year > this.endDate.year || this.startDate.year === this.endDate.year && this.startDate.month > this.endDate.month || this.startDate.year === this.endDate.year && this.startDate.month === this.endDate.month && this.startDate.day > this.endDate.day)) {
            this.startDate = this.endDate;
        }
    }
    startDateChanged(date) {
        if (this.startDate && this.endDate && (this.startDate.year > this.endDate.year || this.startDate.year === this.endDate.year && this.startDate.month > this.endDate.month || this.startDate.year === this.endDate.year && this.startDate.month === this.endDate.month && this.startDate.day > this.endDate.day)) {
            this.endDate = this.startDate;
        }
    }


    sendDTG() {
        this.dateEvent.emit([this.startDate,this.endDate])
      }

}
