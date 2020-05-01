/*
Here we import the default angular modules
*/
import { Component, OnInit} from '@angular/core';

/*
Here we import the modules for creating the interactive charts in the dashboard.
We also import a module wich is required to show tooltips in those charts.
*/
import * as Chartist from 'chartist';
import * as tooltip from 'chartist-plugin-tooltips'

/*
Here we import the service which is used to call functions that perform
API requests to our Flask-API, which will then execute a query on our MongoDB
datastore or PostgreSQL datastore and return the results to the GPSDashboard.
*/
import { GPSDashboardService } from '../../services/gpsdashboard.service'

/*
Here we create the component metadata. The following applies to this code:
1) selector: If we want to use the GPSDashboard component, we add the code:
   <app-gpsdashboard/> to the HTML file in which we want to add the component.
2) templateUrl: The HTML file in which we will define the layout of the
   component.
3) providers: A list of providers (services) in which we have defined the
   functions required to perform API calls.
*/
@Component({
  selector: 'app-gpsdashboard',
  templateUrl: './gpsdashboard.component.html',
  providers: [GPSDashboardService]
})

/*
Here we create the component class called:"GPSDashboard".
*/
export class GPSDashboard implements OnInit {

  /*
  Assign the current date to a global variable of type string(currentDate).
  This variable is used to check when the application / Data was last updated.
  */
  private currentDate:string = new Date().toLocaleString();

  /*
  Below some global variables are defined.

  Here we define a global variable called: "craneMap". This variable is a
  JavascriptMap which stores key/values. The JavascriptMap starts of empty but
  will be populated with the trackers retrieved from the MongoDB datastore.
  */
  private craneMap:Map<string,any[]> = new Map([]);

  /*
  Here we define a global variable called: "trailMap". This variable is a
  JavascriptMap which stores key/values. The JavascriptMap starts of empty but
  will be populated with the trails retrieved from the MongoDB datastore.
  */
  private trailMap:Map<string,any[]> = new Map([]);


  /*
  Here we define a global variable called: "transmissionCount", to which the
  total amount of transmissions in our datastore will be assigned.
  */
  private transmissionCount:any[];

  /*
  Here we define a global variable called: "signalsCount", to which the
  total amount of signals in our datastore will be assigned.
  */
  private signalCount:any[];

  /*
  Here we define a global variable called: "activeTab". The default value of the
  variable is 'tracker', this means that when the dashboard is loaded the
  tracker tab will be active in the interactive table.

  The value of this global variable can be changed using the function:
  "setActiveTab()". This function is defined later on in this file.
  */
  private activeTab:string = 'tracker';

  /*
  Here we create the class constructor of the MapComponent. We pass the
  GPSDashboardService in the constructor. We assign the service to a variable,
  this variable can be reused throughout the whole component. We use the
  variable to call the functions in our service which will then perform API
  calls to our Flask-API.
  */
  constructor(private _GPSDashboardService:GPSDashboardService) {}

  /*
  Here we create the ngOnInit() function. All the logic in this function will
  be executed when the component is loaded.
  */
  ngOnInit() {
    this.getTrackers()
    this.getTotalTransmissions()
    this.getTrails()
    this.getTotalSignals()
  }

  /*
  Below some functions are defined to retrieve all the data from our MongoDB
  datastore. These functions are as follows:
  1) getTrackers()
  2) getTotalTransmissions()
  3) getTrails()
  4) getTotalSignals()

  The syntax used in these functions is as follows:
  this.{service}.{function}.subscribe({elements} =>
    {elements}.forEach({element} =>{
      this.{JavascriptMap}.set(element['name'],element)
    })
  )
  where:
  - service = the service which contains the API call functions
  - function = the function from the service you want to trigger. This function
    will then return the data retrieved from our datastore.
  - elements = this name can be generic. This value stands for the list of
    data returned by the function. A foreach function is performed on the list
    of data because we want to add all rows in the elements to the JavascriptMap
    it belongs to.
  - element = this name can also be generic. This value stands for 1 row in the
    data returned by the function. We want to add the element/item to the
    JavascriptMap using the name of the element as the key and the element
    itself as the value.

    In the case of a Crane tracker, an entry in the JavascriptMap (craneMap)
    would be: {key = "Agnetha", value = [coordinates, study_name, etc..]}

  Here we create the function: "getTrackers()".

  This function is used to call the function getTrackers() in our
  GPSDashboardService, which will then return all the trackers and add them
  to the global JavascriptMap called: "craneMap".
  */
  getTrackers(): void {
    this._GPSDashboardService.getTrackers().subscribe(trackers =>(
      trackers.forEach(tracker => {
        this.craneMap.set(tracker['name'], tracker)
      }),
      this.createChart('line',trackers,'name','transmission_Count','#craneChart','Transmissions:'))
    );
  };

  /*
  Here we create the function: "getTotalTransmissions()".

  This function is used to call the function getTransmissionCount() in our
  GPSDashboardService, which will then return the total amount of
  transmission in our MongoDB datastore and the value to the to the global
  variable transmissionCount.
  */
  getTotalTransmissions():void{
    this._GPSDashboardService.getTransmissionCount().subscribe(
      count => this.transmissionCount = count
    );
  };

  /*
  Here we create the function: "getTrails()".

  This function is used to call the function getTrails() in our
  GPSDashboardService, which will then return all the trails and add them
  to the global JavascriptMap called: "trailMap".
  */
  getTrails(): void {
    this._GPSDashboardService.getTrails().subscribe(trails => (
      trails.forEach(trail => {
        this.trailMap.set(trail['name'], trail)
      }),
      this.createChart('bar',trails,'abr','t_points','#trailChart','Signals:'))
    );
  }

  /*
  Here we create the function: "getTotalSignals()".

  This function is used to call the function getSignalCount() in our
  GPSDashboardService, which will then return the total amount of
  signals in our MongoDB datastore and the value to the to the global
  variable signalCount.
  */
  getTotalSignals():void{
    this._GPSDashboardService.getSignalCount().subscribe(
      signalCount => this.signalCount = signalCount
    );
  }

  /*
  Here we create the generic function: "createChart()".

  This function is used to create a chart using the Chartist library.
  In the function we pass the following parameters:
  - type = The type of chart that need to be created. This can either be a
           bar chart or a line chart.
  - data = The list of data that is going to be displayed in the chart.
  - labels = The name of the column that represents the name of the items.
             in the case of the trackers this column is called: "name"
  - points = The name of the column that represents the amount of datapoints.
             in the case of the trials this column is called:
             "transmission_Count"
  - HTMLElement = The id of the HTMLElement in which the chart is going to be
                  added. This HTMLElement is defined in the html page of this
                  component.
  - description = The description which is going to be displayed in the tooltip
                  in the case of the trackers this is going to be Transmissions.
  */
  createChart(type,data,labels,points,HTMLElement,description):void{
    /*
    To be able to display tooltips we need to instantiate an instance of
    the tooltip. This is done using the code below.
    */
    let tool = tooltip

    /*
    Below we create an empty list of labels and an empty list of series.
    The names of e.g. the trackers are going to be appended to the label list.
    The amount of .e.g transmissions per tracker is going to be appended to
    the series list.
    */
		let _labels= []
    let _series= []

    /*
    Below we create a forEach loop that loops through all the datarows in the
    datalist passed as parameter in this function. For each row we append the
    name of e.g. the tracker to the labels list and the amount of .e.g.
    transmissions per tracker to the series list. We pass the parameters passed
    in the function: "createChart()", as names of the columns that contain the
    required data.

    In the case of the Crane trackers the value in the forEach loop will be as
    follows:

    trackerlist.forEach(tracker => {
			_labels.push(element['name'])
			_series.push(element['transmission_Count'])
		});

    Then we will end up with a graph that contains 6 Crane names and their
    corresponding amount of transmissions.
    */
		data.forEach(element => {
			_labels.push(element[labels])
			_series.push(element[points])
		});

    /*
    Here we Assign the labels and series to a variable called chartData.
    This variable will be used later on when the chart is created.
    As you can see we pass the description parameter passed in the function:
    "createChart()" as metadata for the series of the chart.
    */
		var chartData = {
			labels: _labels,
			series: [{meta: description, value:_series }]
    };

    /*
    Here we define the settings / properties of the chart and assign them to a
    variable called chartSettings.
    This variable will be used later on when the chart is created.

    As you can see we pass the description parameter passed in the function:
    "createChart()" as metadata for the series of the chart.

    For more information on what settings there are, you can visit the website:
    https://gionkunz.github.io/chartist-js/api-documentation.html
    */
    let chartSettings = {
      /*
      The high and low values represent the max and min value of the y-axis
      in the chart. We use the build-in Javascript function:"Math.max/min"
      to obtain the lowest and highest values in the series (transmissions or
      signals)
      */
      high: Math.max(..._series),
      low: Math.min(..._series),
      /*
      Here we define what the padding of the charts need to be.
      */
      chartPadding: {top: 0,right: 30,bottom: 0,left: 15},
      showArea:true,
      showGrid: false,
      showLine: false,
      fullWidth: true,
      /*
      Here we assign what plugins are going to be loaded in the charts.
      At this point we only need the tooltip plugin. You can visit the
      chartist documentation for more available plugins by clicking on the URL:
      https://gionkunz.github.io/chartist-js/api-documentation.html
      */
      plugins: [Chartist.plugins.tooltip()]
    }

    /*
    Here we create an empty variable called chart. Depending on what the value
    of the parameter: "type", a chart of that type will be created
    and assigned to the variable: "Chart".
    */
    let chart;

    /*
    Below we create an IF/ELSE statement. If the value of the type, passed as
    parameter when this function is called, is equal to "bar", a bar chart
    is created. If the value of type is NOT equal to bar, a line chart is
    created.

    As parameters the HTMLElement in which the chart will be created, the
    chartData and the chartSettings are passsed.
    */
    if (type == 'bar') {
      chart = new Chartist.Bar(HTMLElement,chartData,chartSettings)
      this.animateBarChart(chart);
    } else {
      chart = new Chartist.Line(HTMLElement,chartData,chartSettings)
      this.animateLineChart(chart);
    }
  };
  /*
  Here we create the function: "setActiveTab()".

  This function is used to switch between the Categories in our interactive
  table. This function will be triggered when one of the buttons in the header
  of this table is clicked. Depending on which category/button you click, the
  value of this category/button is passed in the function, which then changes
  the global variable: "activeTab" to the value passed in the function.
  */
  setActiveTab(tab):void{
	  this.activeTab = tab;
  };

  /*
  Here we create the function: "generateProfile()".

  This function is used to send perform an API call on the URL passed as
  parameter in this function. Since Angular uses a router, we need to open
  a new blank window in which the profile will be generated. After the API
  is finished generating this profile the profile will be displayed in the
  window openend by this function.

  This function is assigned and triggered using the buttons in the interactive
  table which are defined in the layout page of this component:
  "gpsdashboard.component.html"
  */
  generateProfile(url):void{
    window.open(url,'_blank');
  };

  animateLineChart(chart):void{
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  };

  animateBarChart(chart):void{
    let seq2: any, delays2: any, durations2: any;
    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data) {
      if (data.type === 'bar') {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });
    seq2 = 0;
  };
}
