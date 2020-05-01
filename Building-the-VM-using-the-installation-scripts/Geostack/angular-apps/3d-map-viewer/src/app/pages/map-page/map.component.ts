/*
Here we import the default angular modules
*/
import { Component, OnInit} from '@angular/core';

/*
Here we import the modules for creating the interactive charts in the map.
We also import a module wich is required to show tooltips in those charts.
*/
import * as Chartist from 'chartist';
import * as tooltip from 'chartist-plugin-tooltips'

/*
Here we import the services which are used to call functions that perform
API requests to our Flask-API, which will then execute a query on our MongoDB
datastore.
*/
import {MapService} from 'src/app/services/map.service'
import {CraneService} from 'src/app/services/crane.service'
import {TrailService} from 'src/app/services/trail.service'

/*
Here we create a class which defines what attributes an item is going to
have. When we add a new route to our sidebar, the route needs to have the
attributes defined in the interface.
*/
export class Item {
    //id: The MongoID of the item
    id:string;
    //name: The name of the item
    name:string;
    //type: The item type (e.g. tracker or trail)
    type:string;
    /*timestampColumn: The name of the timestamp column in the dataset belonging
                       to the item.*/
    timestampColumn:any;
    //totalDataLength: The total amount of transmissions or signals
    totalDataLength:number;
    //totalRouteDistance: The total length of the route
    totalRouteDistance:any;
    //layerGroups: A list of layerGroups (lineLayer, markerLayer, pointLayer)
    layerGroups:Map<string,any> = new Map();
    //activeLayerGroup: The active Layer group
    activeLayerGroup:any;
    //coordinateList: A list of coordinates
    coordinateList:any = [];
    //altitudeList: A list of altitudes
    altitudeList:any = [];
    //datetimeList: A list of DTG
    datetimeList:any = [];
    //routeDistanceList: A list of distances between datapoints
    routeDistanceList:any = [0];
    //startCoordinate: The first coordinate of the item
    startCoordinate:any;
    //endCoordinate: The last coordinate of the item
    endCoordinate:any;
    /*currentCoordinateIndex: The index in the coordinate list. This value is
                              incremented when the animation is running.*/
    currentCoordinateIndex:number = 0;
    //animation: The instance of the interval which runs the animation
    animation:any;
    //dateRangeTotal: The start/ end date of the total route
    dateRangeTotal:any;
    //dateRangeSelected: The start / end date of the route that is visualized
    dateRangeSelected:any;
};

/*Here we create a global constant called:"Cesium".
This constant represents the instance of the geospatial framework Cesium.
To use the build in functions of Cesium we first need to call this constant*/
declare const Cesium: any;

/*
Here we create the component metadata. The following applies to this code:
  1) selector: If we want to use the map component, we add the code:
     <app-map/> to the HTML file in which we want to add the component.
  2) templateUrl: The HTML file in which we will define the layout of the
     component.
  3) providers: A list of providers (services) in which we have defined the
     functions required to perform API calls.
*/
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  providers:[MapService,CraneService,TrailService]
})

export class MapComponent implements OnInit {
  /*
  Here we create a global variable called: "map". This is the variable
  to which the OpenLayers map will be assigned after it's created. Because
  of the global vairable we can use the map throughout the whole component.
  */
  private map:any;

  private index = 0;

  /*
  Here we create a global variable called: "mapProviders". The variable
  is a javascript map which will contain key|values. The javascript map will be
  populated with available map providers once the function:"getTilestacheEntries"
  is triggerd.
  */
  private mapProviders:Map<any,any> = new Map();

  /*
  Here we create a global variable called: "mapTileLayer". This is the variable
  to which the baselayer containing the tiles of the map wil be assigned.
  */
  private mapTileLayer:any = new Cesium.OpenStreetMapImageryProvider({
    url : 'http://localhost/tiles/openstreetmap-web/'
  });

  /*
  Here we create a global variable called: "mapTerrainLayer". This is the
  variable to which the baselayer containing the elevationMaps wil be assigned.
  */
  private mapTerrainLayer:any =  new Cesium.CesiumTerrainProvider({
    url : 'http://localhost:8080/tilesets/M_52EZ2'
  });

  /*
  Here we create a global variable called: "items". The type of the variable
  is a list of Items. This list starts of empty, but when we call the function(s)
  that retrieve the trackers and routes froxxm the datastore, the emtpy list will
  be populated with these results.
  */
  private items:Item[] = [];

  /*
  Here we create a global variable called: "selectedItems".
  The type of the variable is a list of Items. This list starts of empty,
  but when we select an item form the dropdown box in the application the
  function: "selectItem()" will be triggerd.

  This function will then add the selected item to the selectedItems list.
  */
  private selectedItems:Item[] = [];

  /*
  Here we create a global variable called: "activeItem".
  When an item is selected using the function: "selectItem()"
  the item will become the activeItem.
  */
  private activeItem:Item = new Item();

  /*
  Here we create a global variable called: "dateRange". The value of this
  variable is passed to the DateTimePicker Component. The default value is
  0 but will change when an item is selected.
  */
  public dateRange:any = [0,0];

  /*
  Here we create a global variable called: "countryList".

  The type of this variable is a JavaScriptMap which contains the polygone
  coordinates of countries in which you can select transmissions or signals.
  The items in this JavaScriptMap will populate the dropdown list related
  to the country selection.

  If you want to add more countries to this dropdown list you can navigate to
  the website:
  https://www.keene.edu/campus/maps/tool/

  On this website you can select a polygone and get the coordinates of the
  selected polygone.

  The you can copy paste these coordinates in this JavaScriptMap and give a
  suitable name to the new entry.
  */
  private countryList:Map<string,Number[][]> = new Map([
    ["Spain", [[-10.6347656,44.3081267],
               [-11.0961914,36.3859128],
               [1.9995117,36.7740925],
               [3.4716797,43.7869584],
               [-10.6347656,44.3081267]]],
    ["Netherlands",[[3.1750488,53.6055441],
                   [2.9992676,50.8336977],
                   [6.3391113,50.7086344],
                   [7.3168945,53.5794615],
                   [3.1750488,53.6055441]]],
  ]);

  /*
  Here we create the class constructor of the MapComponent. We pass the map and
  CraneServices in the constructor. We assign the services to a fitting variable,
  this variable can be reused throughout the whole component. We use these
  variables to call the functions in our services which will then perform API
  calls to our Flask-API.
  */
  constructor( private _MapService:MapService,
               private _CraneService:CraneService,
               private _TrailService:TrailService){}
  /*
  Here we create the ngOnInit() function. All the logic in this function will
  be executed when the component is loaded.
  */
  ngOnInit(){

    this.createCesiumMap();

    this.getItems();
  }

  /*
	Here we create a function called: "timeConverter()".
	This function is used to convert all the timestamps received from the
	datastores and passed to the function into a human readable date time group.
	*/
	timeConverter(timestamp): string {

		// First we create a new Date using the timestamp passed as parameter.
		// We assing the new date to a variable called: "a".
		let a = new Date(timestamp);

		// Here we obtain the year of the timestamp passed as parameter in this
		// function.
		let year = a.getFullYear();
		// Here we obtain the month of the timestamp passed as parameter in this
		// function.
		let month = ('0' + (a.getMonth()+1).toString()).slice(-2);
		// Here we obtain the day of the timestamp passed as parameter in this
		// function.
		let day = ('0' + a.getDate().toString()).slice(-2);

		// Here we add a fix to make sure that when a day or month is equal to
		// 0, it will be set to 1.
		day == '00' ? day = '01' : null;
		month == '00' ? month = '01' : null;

		// Here we create a string by combining the day, month and year.
		let time = day + '-' + month + '-' + year;

		// Here we return the string.
		return time;
	};

  /*
  Here we create the function to retrieve all the WMS entries in our Tilestache
  configuration. This function triggers the function getTilestacheEntries() in
  the MapService. The it populates the mapProviders javascript map with all the
  retrieved entries.
  */
  getMapProviders():void{
    this._MapService.getTilestacheEntries().subscribe(
      (providers:[]) => (
        providers.forEach( provider =>{
          provider != "" ? this.mapProviders.set(provider, provider) : null;
        })
      )
    )
  };

  /*
  Here we create the function that changes the mapProvider. When the function is
  triggerd a providerKey is passed. This providerKey is the key of the entry in
  the javascript map: "mapProviders". This function is assigned to the WMSSelection
  settings menu.
  */
  setMapProvider(providerKey):void{

    var layers = this.map.scene.imageryLayers;

    layers.removeAll();

    this.mapTileLayer = new Cesium.OpenStreetMapImageryProvider({
        url : "http://localhost/tiles/"+providerKey+"/"
    });

    layers.addImageryProvider(this.mapTileLayer);
  };

  /*
  Here we create the function which creates a new instance of an OpenLayers map.
  in the function we create a View and assign the baselayer to the map. The map
  will be created in the HTML div element with the id: "map". This is the div
  element in the layout of the MapComponent (map.component.html)
  */
  createCesiumMap():void{
    this.getMapProviders()
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYmQ5NzVhYS04YjUxLTRjZmQtYTM1My04NjQ3N2E3NTUyMDUiLCJpZCI6MTc3MDQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzI2MTg1MTd9.QZm6CyLKf8qp3HZbEVgViRpGP5OvuayzTuAO-mzfudQ';
    this.map = new Cesium.Viewer('map',
     {
        imageryProvider: this.mapTileLayer,
        terrainProvider: this.mapTerrainLayer,
      });

    this.map.allowDataSourcesToSuspendAnimation = false;
  };
  /*
  Here we create a function called: "zoomToLocation()"

  This function is assigned to the button: "Zoom to start", defined in the
  HTML file of the MapComponent.

  The function gets the current view and animates it to move to the start
  coordinates of the item on which the: "zoom to start" button is clicked.

  There are 2 animations which are executed, these are as follows:
  - Move to the location of the startCoordinate
  - Zoom out and in again on the startCoordinate

  The variable: "duration" defines the amount of time it takes for the animation
  to complete.
  */
  zoomToLocation():void{
    this.map.scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        this.activeItem.startCoordinate[0],
        this.activeItem.startCoordinate[1],
        1000),
      duration: 3,
    })
  };

  /*
  Here we create a function called: "addItem()"

  This function is called on each item retrieved in the getItems() function.
  The function: addItem() then creates a new item and assigns the parameters
  passed in the function to the newly created item.
  The parameters are as follows:
  - itemId : The MongoID of the item that is added.
  - itemName : The name of the item that is added.
  - itemType : The itemType, this is neccasery because we want to be able to
               visualize multiple types of datasets such as trackers and trails.
  - itemRouteLength : The total amount of transmissions / signals belonging to
                      the tracker / trail that is added.
  - itemTimeColumn : The name of the timestamp column in the dataset. This is
                     required since the columnname representing the timestamp
                     differs in each dataset.
  - itemDTG : The total timeframe of the route, this is NOT the timeframe of the
              amount of transmissions / signals which are visualized. This value
              is used to set a begin and end date in the calendar used to select
              a DTG (Date time group). The value passed as parameter is a line
              of the start and end date of the route.

  When all the values are assigned to the item, the item is added to the global
  variable: items, which is a list of al items (trackers and trails) in the
  database.

  The global variable Items populates the list of items that can be selected
  in the application.
  */
  addItem(itemId,itemName,itemType,itemRouteLength,itemTimeColumn,itemDTG):void{

    let item = new Item();

    item.id = itemId;

    item.name = itemName;

    item.type = itemType;

    item.totalDataLength = itemRouteLength;

    item.dateRangeTotal = itemDTG;

    item.timestampColumn = itemTimeColumn;

    this.items.push(item);
  };

  /*
  Here we create a function called: "getItems()"

  This function is triggerd in the ngOnInit() function. This function triggers
  the function: "getTrackers()" in our CraneService file, which then returns
  all the trackers in our MongoDB datastore.

  The syntax used in the function is as follows:

  this.{service}.{function}.subscribe({elements} =>
    {elements}.forEach({element} =>{
      addItem(elementvalues)
    });
  );

  The following applies to the syntax above:
  - service = the service which contains the API call functions
  - function = the function from the service you want to trigger. This function
    will then return the data retrieved from our datastore.
  - elements = this name can be generic. This value stands for the list of
    data returned by the function. A foreach function is performed on the list
    of data because we want to add all rows in the elements to the JavascriptMap
    it belongs to.
  - element = this name can also be generic. This value stands for 1 row in the
    data returned by the function. For each element we trigger the function:
    "addItem()". We pass the required values as parameters in the function:
    "addItem()"
  */
  getItems():void{
    this._CraneService.getTrackers().subscribe(
      (trackers:[]) => (
        trackers.forEach(tracker =>{
          this.addItem(
            tracker['_id']['$oid'],tracker['name'],'tracker',
            tracker['transmission_Count'],'timestamp',
            [tracker['start_date']['$date'],tracker['end_date']['$date']],
          );
        })
      )
    );

    this._TrailService.getTrails().subscribe(
      (trails:[]) => (
        trails.forEach(trail =>{
          this.addItem(
            trail['_id']['$oid'],trail['name'],'trail',
            trail['t_points'],'time',
            [trail['s_date']['$date'],trail['e_date']['$date']],
          );
        })
      )
    );
  };

  /*
  Here we create a function called: "selectItem".

  This function is triggerd when one of the items in the ItemList is clicked in
  the application. The item that is clicked is then passed as parameter.

  When the function is triggered the follow steps are performed:
  1) The selected item becomes the activeItem.

  2) the function: ".filter()" is executed on the global JavascriptMap:
     "selectedItems".

     This JavascriptMap contains all the items that are have
     been selected.

     The filter function is used to check whether the id (From
     the item that is being selected) is already in the list assigned to the
     global variable: "selectedItems".

     If this is the case the selected item will become the activeItem and the
     overlays (the information popups) will be filled with the information of
     the item that is currently active (The itme that was selected), using the
     function setStaticOverlays().

     In this function the item which was passed in the function and thus was
     selected is passed.

     If the itemId, of the item that is being selected, is not in the list of
     selectedItems the following will happen:

     1) The function: "getInitalItemData()" will be triggered. In the function
        the item will be passed. This function will retrieve the first 100
        transmissions / signals beloning to that item.

     2) The item is added to the selectedItems list.

  3) The active dateRange(The start and end date in the DTG picker) global
     variable is Changed to the dateRangeTotal of the selected item.
  */
  selectItem(item:Item):void{

    this.activeItem = item;

    this.selectedItems.filter(
      data => data.id.includes(item.id)).length == 1 ? null
      : (this.getInitalItemData(item),this.selectedItems.push(item))

    this.dateRange = this.activeItem.dateRangeTotal;
  };

  /*
  Here we create a function called: "removeItem()"

  This function is assigned to the delete button next to each item in the list
  of selectedItems. The item on which the delete button is clicked is then
  passed as parameter in the function: "removeItem()"

  If the function is triggered the following happens:
  1) A check is performed to see if the item that is being deleted is the
     item that is currently active. If this is the case the following happens:
     1) If there is an animation running, the animation is cleared.
     2) The next value(If there is any) in the list of selectedItems becomes the
        activeItem.
     If the item that is being deleted is not the activeItem, nothing happens

  2) A forEach loop is called on the list containing the layerGroups belonging
     to the item that is being deleted. All layers from the layerGroup in the
     list of layerGroups are then removed from the map using the build-in
     OpenLayers function:".removeLayer()". In this function the layer to remove
     is passed.

  3) The list of layerGroups belonging to the item that is being removed is
     cleared.

  4) The build-in JavaScript function: ".filter()" is called on the list of
     selectedItems. The value to filter on is the itemID of the item that needs
     to be removed. If the item is found, the function: ".splice()" is called
     on the selectedItems list. In this function the index of the item that
     needs to be removed is passed.

     The function:".splice()", than removes the item from the list.

  5) A check if performed to find out whether the item that was removed was the
     last item in the list.

     If this is the case all overlays( information popups) will be toggled off.
     If this is NOT the case the overlays will be placed in the position of the
     new activeItem which was set in step 1.
  */
  removeItem(item:Item):void{

    /**
     * If the itemId of the item to remove is the same as the id of the item that is currently
     * active. Change the activeItem to the next item in the list.
    */
    this.activeItem.id == item.id ? this.selectItem(this.selectedItems.values().next().value)
                                    : null;


    item.layerGroups.forEach(layerGroup => {
      layerGroup.forEach(entity =>
        this.map.entities.remove(entity)
      );
    });

    item.layerGroups.clear();

    /**
     * Loop trough all selected items. If the id of the item to remove == to the id
     * of the value at the current index: Remove that item using the .splice() function
     * on the selectedItems list. As parameter we pass the index on which the loo p is.
     */
    this.selectedItems.filter(
      (value, index) => value.id ==  item.id ? this.selectedItems.splice(index,1) : null)

  }

  /*
  Here we create a function called: "getInitalItemData()"

  This function is called in the function: "selectItem()", if the item has not
  been selected yet. The item from which the data has to be retrieved is then
  passed as parameter in this function.

  This function contains a switch/case. The switch case takes the itemType,
  which in our case can be a tracker or a trail, as input. Depending on the
  itemType, the corresponding function is triggerd.

  These functions trigger a function in the service related to the item which
  is passed in the function: "getInitalItemData()".

  The data obtained from the function which was triggered in the service, will
  then be passed as parameter in the function: "loadItemData()". The function
  loadItemData() will then assign the returned data to the item which was
  selected in the function: "selectItem()"
  */
  getInitalItemData(item:Item):void{

    switch (item.type) {
      case 'tracker':
          this._CraneService.getTransmissionsID(item.id).subscribe(
            (transmissions) => {this.loadItemData(transmissions)}
          )
        break;
      case 'trail':
          this._TrailService.getSignalsID(item.id).subscribe(
            (transmissions) => {this.loadItemData(transmissions)}
          )
        break;
      default:
        break;
    }
  };

  /*
  Here we create a function called: "loadItemData()"

  This function is called in the following functions:
  1) getInitalItemData()
  2) getItemDataByDTG()
  3) getItemDataByAmount()
  4) getItemDataByCountry()

  Each of these functions obtain data from the MongoDB datastore and pass the
  returned data to the function "loadItemData()" as parameter.


  The function then does the following:
  1) Assign the activeItem to a variable called: "item". This is done so we
     only need to use the variable item instead of code: "this.activeItem".

  2) Set the value of the coordinateList belonging to the item to an empty list.

  3) Set the value of the altitudeList belonging to the item to an empty list.

  4) Set the value of the datetimeList belonging to the item to an empty list.

  5) Execute a forEach loop on the ItemList, the foreach loop does the following
     for all the rows in the list of data:

     5.1) Obtain the value of the coordinates and transform them to a format
          which can be used with OpenLayers. For this we use the the syntax:
          "ol.proj.fromLonLat()", in which we pass the value of the
          coordinate column as parameter. After the coordinate has been
          transformed it is added to the coordinateList belonging to the item.

     5.2) Obtain the value of the altitude column and append it to the
          altitudeList belonging to the item.

     5.3) Obtain the value of the timestamp column and append it to the
          datetimeList belonging to the item.

  6) Assign the first value of the coordinateList (the value at index 0) to
     the variable: "startCoordinate".

  7) Assign the last value of the coordinateList (the value at index length
     of the datalist passed as parameter - 1) to the variable endCoordinate.

  8) Create a list containing the first item in the datetimeList and the last
     item of the datetimeList, created in step 5.3, and assign it to the
     variable: "dateRangeSelected".

  9) Trigger the function: "addLayerGroup()", and pass the activeItem as
     parameter. The function: "addLayerGroup()" wil then create the first
     layerGroup.
  */
  loadItemData(data:any[]):void{

    let item = this.activeItem;

    item.coordinateList = [];

    item.altitudeList = [];

    item.datetimeList = [];

    data.forEach(row => {

      item.coordinateList.push(row.geometry.coord.coordinates);

      item.altitudeList.push(row.geometry.alt);

      item.datetimeList.push(
        this.timeConverter(row[item.timestampColumn].$date)
      );
    });

    item.startCoordinate = item.coordinateList[0];

    item.endCoordinate = item.coordinateList[data.length - 1];

    item.dateRangeSelected = (
      this.timeConverter(data[0][item.timestampColumn]['$date']) + '/'+
      this.timeConverter(data[data.length-1][item.timestampColumn]['$date'])
    );

    this.addLayerGroup(item);

  };

  /*
    Here we create a function called: "addLayerGroup()".

    This function will create the following layers for the item that is passed as
    parameter when te function is triggered in the function:"loadItemData()":
    - lineLayer: This is the layer that creates the lines between the datapoints.

    The following happens when the function is triggered:
    1) We assign the value of "this" to a variable called: "_this". We need to do
       this when we want to use global variables in an nested function. A nested
       function is a function inside another function.
    2) We assign the value of the dateRangeSelected selected to the variable
       called: "layerGroupSelector". We do this because the keys in the
       JavascriptMap are the dateRangeSelected values of each layerGroup.

       We are going to use the variable: "layerGroupSelector" to select specific
       layerGroups.

    3) A check is performed to see whether a layerGroup with that key already
       exists in the JavascriptMap: "layerGroups".

       If this is the case nothing will happen.

       If this is NOT the case the following steps will be executed.

    */
  addLayerGroup(item:Item):void{
          let _this = this;

          let layerGroupSelector = item.dateRangeSelected;

          let viewer = this.map

          let lineLayer = [];

          if(!item.layerGroups.has(layerGroupSelector)){
            //Set bounds of our simulation time
            var start = Cesium.JulianDate.fromDate(new Date(2016, 7, 30, 0));
            var stop = Cesium.JulianDate.addSeconds(start, _this.activeItem.coordinateList.length-1, new Cesium.JulianDate());

            //Make sure viewer is at the desired time.
            viewer.clock.startTime = start.clone();
            viewer.clock.stopTime = stop.clone();
            viewer.clock.currentTime = start.clone();
            viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
            viewer.clock.multiplier = 10;
            viewer.timeline.zoomTo(start, stop);

            //Generate a random circular pattern with varying heights.
            function generateDataPoints() {
                var property = new Cesium.SampledPositionProperty();

                for (var i = 0; i < _this.activeItem.coordinateList.length-1; i+=4) {

                    var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());

                    var position = Cesium.Cartesian3.fromDegrees(_this.activeItem.coordinateList[i][0],_this.activeItem.coordinateList[i][1], _this.activeItem.altitudeList[i]+10);

                    property.addSample(time, position);

                    let entity = viewer.entities.add({
                        position : position,
                        point : {
                            pixelSize : 10,
                            color : Cesium.Color.TRANSPARENT
                        }
                    });

                    lineLayer.push(entity)
                }
                return property;
            }

            var position = generateDataPoints();

            //Actually create the entity
            var entity = viewer.entities.add({
                name:_this.activeItem.name,
            //Set the entity availability to the same interval as the simulation time.
                availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start : start,
                    stop : stop
                })]),

                //Use our computed positions
                position : position,

                //Automatically compute orientation based on position movement.
                orientation : new Cesium.VelocityOrientationProperty(position),

                //Show the path as a pink line sampled in 1 second increments.
                path : {
                    leadTime: 0,
                    trailTime: 3 * 60,  // 3 minutes, in seconds of simulation time
                    resolution : 1,
                    material : new Cesium.PolylineGlowMaterialProperty({
                        glowPower : 0.1,
                        color : Cesium.Color.YELLOW
                    }),
                    width : 10
                },
            });

            entity.position.setInterpolationOptions({
                interpolationDegree : 10,
                interpolationAlgorithm : Cesium.LagrangePolynomialApproximation
            });

            lineLayer.push(entity)

            item.layerGroups.set(layerGroupSelector,lineLayer)

            this.setLayerGroup(layerGroupSelector);
          }
      };

  setLayerGroup(groupKey:string):void{

    let item = this.activeItem

    item.dateRangeSelected = groupKey;

    item.activeLayerGroup = item.layerGroups.get(groupKey)

  }

  removeLayerGroup(layerGroupKey:string):void{

    let item = this.activeItem;

    let groupToRemove = item.layerGroups.get(layerGroupKey)

    groupToRemove.forEach(entity =>
      this.map.entities.remove(entity)
    );

    item.layerGroups.delete(layerGroupKey)

    item.layerGroups.size > 0 ? this.setLayerGroup(item.layerGroups.keys().next().value)
    : this.removeItem(item)

  };

  getItemDataByDTG(item:Item,dtg_s,dtg_e):void{
    console.log(dtg_s+dtg_e)
    switch (item.type) {
      case 'tracker':
        this._CraneService.getTransmissionsDTG(item.id,dtg_s,dtg_e).subscribe(
          (transmissions) =>{this.loadItemData(transmissions)}
        )
        break;
      default:
        break;
    }
  };

  getDTGEvent(id:string,$event):void{
    let dtg_s = $event[0].year + '-' + $event[0].month + '-' + $event[0].day
    let dtg_e = $event[1].year + '-' + $event[1].month + '-' + $event[1].day
    this.getItemDataByDTG(this.activeItem,dtg_s,dtg_e)
  };

  getItemDataByAmount(item:Item,amount):void{
    switch (item.type) {
      case 'tracker':
        this._CraneService.getTransmissionsAmount(item.id,amount).subscribe(
          (transmissions) =>{this.loadItemData(transmissions)}
        )
        break;
      default:
        break;
    };
  };

  getItemDataByCountry(item:Item,coords:Number[][]):void{
    switch (item.type) {
      case 'tracker':
        this._CraneService.getTransmissionsCountry(item.id,coords).subscribe(
          (transmissions) =>{this.loadItemData(transmissions)}
        )
        break;
      default:
        break;
    };
  };
}
