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

/*Here we create a global constant called:"ol".
This constant represents the instance of the geospatial framework OpenLayers.
To use the build in functions of OpenLayers we first need to call this constant*/
declare const ol: any;

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

/* Here we create the component metadata. The following applies to this code:
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

  /*
  Here we create a global variable called: "mapProviders". The variable
  is a javascript map which will contain key|values. The javascript map will be
  populated with available map providers once the function:"getTilestacheEntries"
  is triggerd.
  */
  private mapProviders:Map<any,any> = new Map();

  /*
  Here we create a global variable called: "mapLayer". This is the variable to
  which the baselayer of the map wil be assigned.

  We set the default map (The map that will be shown when the component is
  loaded) to the local openstreetmap.
  */
  private mapLayer:any = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "http://localhost/tiles/openstreetmap-local/{z}/{x}/{y}.png"
    }),
    zIndex:1
  });

  private seaLayer:any = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "http://localhost/tiles/openseamap-local/{z}/{x}/{y}.png"
    }),
    zIndex:2
  });

  /*
  Here we create a global variable called: "items". The type of the variable
  is a list of Items. This list starts of empty, but when we call the function(s)
  that retrieve the trackers and routes from the datastore, the emtpy list will
  be populated with these results.
  */
  private items:Item[] = [];

  /*
  Here we create a global variable called: "selectedItems".
  The type of the variable is a list of Items. This list starts of empty,
  but when we select an item form the dropdown box in the application the
  function: "selectItem()" will be triggered.

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
  Here we create a global variable called: "layerStyles".
  The value of this variable is a dictionary that contains the default
  styling of the layers.

  To create a line we use the OpenLayers style: "Stroke". We give the stroke
  a width and a color.

  To create a marker we use the OpenLayers style: "Icon". We pass the
  location of our pins as source of the icon. We also anchor the icon
  to be displayed above the datapoint.
  */
  private layerStyles:any = {
    'lineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            width:2,
            color:"#FF0000",
        })
    }),
    'startMarker': new ol.style.Style({
      image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: `assets/img/pins/pin_s_Red.png`
      })
    }),
    'endMarker': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: `assets/img/pins/pin_e_Red.png`
        })
    })
  };

  /*
  Here we create a global variable called: "styleDict".
  The value of this variable is a dictionary that is empty first.
  When layer styles are changed, the changes are added to the related entry
  in the styleDict.
  */
  private styleDict:any = {'color':'','width':'','type':'','src':''};

  /*
  Here we create a global variable called: "colorList".

  The value of the colorList is a JavaScriptMap which contains key/values.
  The keys are the names of the available colors and the values are the
  hex color code of the related color.

  The user of the application only sees the key in the dropdown list for changing
  the color style. When a color is selected the value of the key will be used.
  */
  private colorList:Map<string,string> = new Map([
    ["Blue", "#0000ff"],
    ["Purple", "#FF33F9"],
    ["Red", "#ff0000"],
    ["LightBlue", "#3377FF"],
    ["Yellow", "#ffbf00"]
  ]);

  /*
  Here we create a global variable called: "widthList".

  The value of the widthList is a JavaScriptMap which contains key/values.
  The keys are the names of the available widths and the values are the
  actual numbers belonging to the width.

  The user of the application only sees the key in the dropdown list for changing
  the width style. When a width is selected the value belonging to the selected
  width is used.
  */
  private widthList:Map<string,number> = new Map([
    ["1 Pixel", 1],
    ["2 Pixel", 2],
    ["3 Pixel", 3],
    ["4 Pixel", 4]
  ]);

  /*
  Here we create a global variable called: "lineTypeList".

  The value of the widthList is a JavaScriptMap which contains key/values.
  The keys are the names of the available widths and the values are the
  actual numbers belonging to the width.

  The user of the application only sees the key in the dropdown list for changing
  the width style. When a width is selected the value belonging to the selected
  width is used.
  */
  private lineTypeList:Map<string,number[]> = new Map([
      ["Dotted", [.1,5]],
      ["Striped", [10,25]],
      ["Fluent", [0,0]]
  ]);

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

  private elevationProfile:any;

  private elevationProfileOpen:boolean;

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

    // Here we trigger the function that created the OpenLayers map.
    this.createOpenLayersMap();

    // Here we trigger the function which retrievs all the trackers from our
    // datastore.
    this.getItems();
  }

  /*
  Here we create a function called: "timeConverter()".
  This function is used to convert all the timestamps received from the
  datastores and passed to the function into a human readable date time group.
  */
  timeConverter(timestamp):string{
    let a = new Date(timestamp);
    let year = a.getFullYear();
    let month = ('0' + a.getMonth().toString()).slice(-2);
    let day = ('0' + a.getDate().toString()).slice(-2);

    // Here we add a fix to make sure that when a day or month is equal to
    // 0, it will be set to 1.
    day == '00' ? day = '01' : null;
    month == '00' ? month = '01' : null;

    let time = day + '-' + month + '-' + year;
    return time;
  };


  /*
  Here we create the function to retrieve all the WMS entries in our Tilestache
  configuration. This function triggers the function getTilestacheEntries() in
  the MapService. Then it populates the mapProviders JavaScriptMap with all the
  obtained entries.

  If an entry is empty ( equal to ""), the entry will not be added to the
  JavaScriptMap.
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
    this.mapLayer.getSource().setUrl(
      "http://localhost/tiles/"+providerKey+"/{z}/{x}/{y}.png"
    )
  };

  /*
  Here we create the function which creates a new instance of an OpenLayers map.
  in the function we create a View and assign the baselayer to the map. The map
  will be created in the HTML div element with the id: "map". This is the div
  element in the layout of the MapComponent (map.component.html)
  */
  createOpenLayersMap():void{

    /*Here we trigger the function:"getMapProviders()" which retrieves the
    entries in our Tilestache server and populates the JavaScriptMap:
    "mapProviders" with the retrieved entries.*/
    this.getMapProviders()

    // Here we create the settings that the map is going to have
    let mapViewSettings = new ol.View({
      maxZoom: 17,
      center: [0, 0],
      zoom: 3
    });

    /*Here we create a new instance of an OpenLayers map.
    We add the settings as value of the view and the baselayer which was
    assigned to the global variable:"mapLayer" as first layer.

    We also call the function:"addOverlays()" to intialize the overlays
    defined in the map.component.html file.*/
    this.map = new ol.Map({
      target: 'map',
      view: mapViewSettings,
      layers:[this.mapLayer,this.seaLayer],
      overlays:this.addOverlays()
    });
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
    let view = this.map.getView()
    let duration = 1500;

    /*
    The code below is used for the animation that moves to the start
    coordinates of the activeItem.
    */
    view.animate({
        center: this.activeItem.startCoordinate,
        duration: duration
    });

    /*
    The code below is used for the animation zooms in and out while moving to
    the start coordinates of the activeItem.
    */
    view.animate({
        zoom: view.getZoom() - 4,
        duration: duration / 2
    }, {
        zoom: 12,
        duration: duration / 2
    });
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
     the item that is currently active (The item that was selected), using the
     function setStaticOverlays().

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

    // Here we set the global variable activeItem to be the selected item.
    this.activeItem = item;

    // Here we check if the item which is selected has been selected before.
    this.selectedItems.filter(
      data => data.id.includes(item.id)).length == 1 ? this.setStaticOverlays(item)
      : (this.getInitalItemData(item),this.selectedItems.push(item))

    this.dateRange = this.activeItem.dateRangeTotal;
  };

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

  10) Trigger the function: "setStaticOverlays()", this function will add
      the data of the selectedItem to the overlays and set the overlays to
      the correct position.

  11) Trigger the function: "createElevationProfile()", this function will
      add populate the elevation profile chart with the data of the new item.
  */
  loadItemData(data:any[]):void{
    // Here we assign the activeItem to a variable called item
    let item = this.activeItem;

    // Here we create empty lists to which we are going to append the data.
    item.coordinateList = [];

    item.altitudeList = [];

    item.datetimeList = [];

    // Here we create a foreach loop which loops through all the rows in the data
    data.forEach(row => {

      // Here we add the transformed coordinates to the coordinate list.
      item.coordinateList.push(
        ol.proj.fromLonLat(row.geometry.coord.coordinates)
      );

      // Here we add the altitude values to the altitude list.
      item.altitudeList.push(row.geometry.alt);

      // Here we add the DTG values to the datetimeList we pass the value of
      // the item.timestampColumn to obtain the value of this column.
      item.datetimeList.push(
        this.timeConverter(row[item.timestampColumn].$date)
      );
    });

    // Here we add the first entry in the coordinateList as startCoordinate
    item.startCoordinate = item.coordinateList[0];

    // Here we add the last entry in the coordinateList as endCoordinate
    item.endCoordinate = item.coordinateList[data.length - 1];

    // Here we set the last and the first values of the timestamp columns as
    // start en end date of the selected route.
    item.dateRangeSelected = (
      this.timeConverter(data[0][item.timestampColumn]['$date']) + '/'+
      this.timeConverter(data[data.length-1][item.timestampColumn]['$date'])
    );

    // Here we create a new layerGroup and add the item as parameter.
    this.addLayerGroup(item);

    // Here we set the static overlays to contain the values of the item.
    this.setStaticOverlays(item);

    // Here we create an elevationProfile for the Item.
    this.createElevationProfile();
  };

  /*
  Here we create a function called: "addLayerGroup()".

  This function will create the following layers for the item that is passed as
  parameter when te function is triggered in the function:"loadItemData()":
  - lineLayer: This is the layer that creates the lines between the datapoints.
  - pointLayer: This is  the layer which will contain the arrows that visualize
                the direction in which the item is going.
  - markerLayer: This layer contains the start and end marker of the visualized
                 route.

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

  4) We create a new OpenLayers lineString geometry using the syntax:
     "new ol.geom.LineString()" in which we pass the coordinateList belonging
     to the item for which we are going to create a layerGroup.

     After the geometry of type LineString is created we assign it to a variable
     called: "lineGeometry".

  5) We create a new lineLayer to which we assign the lineGeometry as geometry.
     We also use a styling function to assign the styling of the lineString.
     The styling is defined and assigned to the global variable: "layerStyles".

     The value assigned to this global variable is a dictionary that contains
     three entries:
     - lineString, which is the styling of the lineLayer.
     - startMarker, which is the styling of the startMarker.
     - endMarker, which is the styling of the endMarker.

  6) An empty list of points is created. We will add all the points, which will
     be created later on, to this list. Then we will pass this list to the
     pointLayer.

  7) An empty list of pointRotations is created. We will add al the calculated
     rotations of the points to this list. The rotation of the point defines
     in which way the arrow icon will point. The arrow icons visualize the
     direction in which the item was moving.

  8) Create a FORLoop that loops trough all the coordinates in the
     coordinateList belonging to the item to which a layerGroup is added.
     In this for loop the following happens for each entry (datarow) in the
     list:

     8.1) A variable point1 is created to which we assign the value of the
          coordinate on the index that the FORLoop is on.

     8.2) A variable point2 is created to which we assign the value of the
          coordinate on the index + 1 that the FORLoop is on.

     8.3) The rotation(direction in which the item was moving) is calculated
          using the build-in JavaScript function: "Math.atan2()". In this
          function we pass 2 parameters, these parameters are as follows:
          - parameter 1: The latitude coordinate of point2 - the latitude
                         coordinate of point1.
          - parameter 2: The longitude coordinate of point2 - the longitude
                         coordinate of point2.
          The result of this calculation is then added to the pointRotations
          list using the build-in JavaScript function: ".push()".

     8.4) The distance between point 1 and point 2 is calculated by creating
          a new OpenLayers geometry of type: "LineString" and passing that
          lineString as parameter in the build-in OpenLayers function:
          "ol.sphere.getLength()".

          Then we add the result to the distance that was calculate in the
          previous pass trough the loop FORLoop.

          Then we add the result of the step above to the list:
          "routeDistanceList", using the build-in JavaScript function:".push()".

          Using this technique makes sure that when we animate the visualized
          route we can see the distance that is traveled.

     8.5) A new feature is created.
          The value (coordinates) of point1 are assigned as geometry of this
          feature.

          We also create a new styling which is assigned to the style of the
          feature. The styling of the feature is an .svg of an arrow. This svg
          is located in the folder: "../../assets/img/" and is called:
          "arrow.svg".

          We pass the rotation which was calculated in step 7.3 as rotation
          of the svg. Because we do this the arrow will point in the direction
          the item was moving.

     8.6) After the point feature is created it's added to the points list.

  9) A new layer is created and assigned to the variable: "pointLayer". We
     create a new VectorSource and assign it to the value: "source" of the
     layer.

     In the newly created VectorSource we assign the list of points, created
     in step 7, to the value: "features".

     We set the layer visibility to false because we only want to show the
     pointLayer when the user toggles it on.

  10) A new Layer is created and assigned to the variable: "markerLayer".
     We create a new VectorSource and assign it to the value: "source" of the
     layer.

     In the VectorSource we create 2 new features. These features are as follows:
     - A feature with the type: "startMarker". We assign the startCoordinate
       value of the item as the feature's geometry.
     - A feature with the type: "endMarker". We assign the endCoordinate value
       of the item as the feature's geometry.

     Here we also use a styling function to assign the styling of the start and
     endMarker. The styling is defined and assigned to the global
     variable: "layerStyles".

     As mentioned before: The value assigned to this global variable is a
     dictionary that contains three entries:
       - lineString, which is the styling of the lineLayer.
       - startMarker, which is the styling of the startMarker.
       - endMarker, which is the styling of the endMarker.

     Then we set the zIndex of the markerLayer to 100. This makes sure that
     the markers are displayed on top of the other features.

  11) A new layerGroup entry is added to the JavascriptMap: "layerGroups"
      belonging to the item.
      The key of this new layerGroup entry is the value of the variable:
      "layerGroupSelector".
      The value of this new layerGroup entry is a dictionary that contains
      the following entries:

      - lineLayer, which has the following values:
        - layer, which contains the actual lineLayer of this layerGroup.
        - coordinates, which contains the coordinates of the datapoints in
          this layerGroup.
        - altitudes, which contains the altitude values of the datapoints in
          this layerGroup.
        - dates, which contains the DTG values of the datapoints in
          this layerGroup.
        - distance, which contains the total distance of the layerGroup.
          The total distance is calculated using the build-in OpenLayers
          function:"ol.sphere.getLength()", in which we pass the value of the
          variable: "lineGeometry", which we created in step 4.

      - pointLayer, which has the following values:
        - layer, which contains the actual pointLayer of this layerGroup.
        - pointRotations, which contains the rotations of all the datapoints in
          this layerGroup.
        - routeDistance, which contains the distance's from point to point in
          this layerGroup.

      - markerLayer, which has the following values:
        - layer, which contains the actual markerLayer of this layerGroup.

  12) The newly created layerGroup is set as activeLayerGroup using the function:
      "setLayerGroup()", and passing the variable: "layerGroupSelector" as
      parameter in this function.

  13) The lineLayer is added to the map using the build-in OpenLayers function:
      ".addLayer()", in which the lineLayer is passed as parameter.

  14) The pointLayer is added to the map using the build-in OpenLayers function:
      ".addLayer()", in which the pointLayer is passed as parameter.

  15) The markerLayer is added to the map using the build-in OpenLayers function:
      ".addLayer()", in which the markerLayer is passed as parameter.
  */
  addLayerGroup(item:Item):void{

      // Here we assign the value of this to a variable called: '_this'.
      // We need to do this since the function: "addLayerGroup" contains
      // nested functions.
      let _this = this;

      // Here we assign the value of the dateRangeSelected as layerGroup
      // selector.
      let layerGroupSelector = item.dateRangeSelected;

      // Here we check whether the layerGroup has already been selected.
      if(!item.layerGroups.has(layerGroupSelector)){

        // Here we create a new lineString and pass the coordinateList as
        // parameter.
        let lineGeometry = new ol.geom.LineString(item.coordinateList);

        // Here we create a new Vector, VectorSource and feature.
        // we add the lineGeometry as geometry of the feature.
        let lineLayer = new ol.layer.Vector({
          source: new ol.source.Vector({
              features: [ new ol.Feature({
                type: 'lineString',
                geometry: lineGeometry
            })]
          }),
          // Here we use a style function to set the styling of the
          // lineLayer.
          style: function(feature) {
              return _this.layerStyles[feature.get('type')];
          },
          zIndex:100
        });

        // Here we create an empty list of points.
        let points = [];

        // Here we create an empty list of pointRotations.
        let pointRotations= [];

        item.routeDistanceList = [0]

        // Here we create a FORloop that loops an amount of times that is
        // equal to the length of the coordinateList.
        for (let i = 0; i < item.coordinateList.length - 1; i++) {

          // Here we create 2 points.
          // The first point gets the value of the coordinates on the index in
          // the coordinateList on which the loop currently is.
          let point1 = item.coordinateList[i]
          // The second point gets the value of the coordinates on the index + 1
          // in the coordinateList on which the loop currently is.
          let point2 = item.coordinateList[i+1]

          // Here we add the calculated rotations to the pointRotations list.
          pointRotations.push(
            Math.atan2(point2[1] - point1[1], point2[0] - point1[0])
          );


          // Here we add the distance between point1 and point2 to the
          // routeDistanceList. We add the calculated distance to the
          // value of the previous entry of the routeDistance list.
          item.routeDistanceList.push(
            item.routeDistanceList[i] += ol.sphere.getLength(
              new ol.geom.LineString([point1,point2])
            )
          );


          // Here we create the pointStyle.
          let pointStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src:'../../assets/img/arrow.svg',
                anchor: [0.75, 0.5],
                scale: 0.5,
                rotateWithView: true,
                rotation: -pointRotations[i],
                color: '#4271AE',
            }),
          })

          // Here we create a new feature from which we set the geometry to
          // the geometry of point1.
          let point = new ol.Feature({
            geometry: new ol.geom.Point(point1),
          });

          // Here we add the styling to the point.
          point.setStyle(pointStyle)

          // Here we add the point to our list of points.
          points.push(point);
        };

        // Here we create the pointlayer and add the list of points as
        // geometry of this feature. We also set the visibility to false
        // since we only want to show the pointLayer when the user toggles it.
        // We also set the zIndex of this layer to 99 since we want it to
        // be displayed below the other layers.
        let pointLayer = new ol.layer.Vector({
          source: new ol.source.Vector({
              features: points
          }),
          visible:false,
          zIndex:99,
        });

        // Here we create the markerLayer to which we add 2 features which
        // are the markers.
        // We set the geometry of the startMarker to the startCoordinate of
        // the item which we are going to add.
        // We set the geometry of the endMarker to the endCoordinate of
        // the item which we are going to add.
        let markerLayer = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [
              new ol.Feature({
                type: 'startMarker',
                geometry: new ol.geom.Point(item.startCoordinate)
              }),
              new ol.Feature({
                type: 'endMarker',
                geometry: new ol.geom.Point(item.endCoordinate)
              })
            ]
          }),
          // Here we use a style function to set the styling of the
          // markers.
          style: function(feature) {
              return _this.layerStyles[feature.get('type')];
          },
          // We also set the zIndex of this layer to 101 since we want it to
          // be displayed on top of the other layers.
          zIndex:101,
        });

        // Here we add a new entry to our layerGroups JavaScriptMap.
        item.layerGroups.set(layerGroupSelector,{
          'lineLayer': {
            'layer': lineLayer,
            'coordinates':item.coordinateList,
            'altitudes':item.altitudeList,
            'dates':item.datetimeList,
            'distance': (Math.round(ol.sphere.getLength(lineGeometry) / 1000 * 100) / 100)
          },
          'pointLayer':{
            'layer': pointLayer,
            'pointRotations':pointRotations,
            'routeDistance':item.routeDistanceList
          },
          'markerLayer': {
            'layer':markerLayer,
          }
        });

        // Here we set the layerGroup to be the activeLayerGroup.
        this.setLayerGroup(layerGroupSelector);

        // Here we add the layers to the OpenLayers map.
        this.map.addLayer(lineLayer);
        this.map.addLayer(pointLayer);
        this.map.addLayer(markerLayer);

      }else{
        return;
      };
  };

  setLayerGroup(groupKey:string):void{

    let item = this.activeItem

    this.clearAnimation()

    item.dateRangeSelected = groupKey;

    item.activeLayerGroup = item.layerGroups.get(groupKey)

    item.totalRouteDistance = item.activeLayerGroup.lineLayer.distance;

    item.coordinateList = item.activeLayerGroup.lineLayer.coordinates;

    item.altitudeList = item.activeLayerGroup.lineLayer.altitudes;

    item.datetimeList = item.activeLayerGroup.lineLayer.dates;

    item.startCoordinate = item.activeLayerGroup.lineLayer.coordinates[0];

    item.endCoordinate = item.activeLayerGroup.lineLayer.coordinates
    [
      item.coordinateList.length - 1
    ]

    this.toggleOverlay("all")
    this.setStaticOverlays(item)
  }

  removeLayerGroup(layerGroupKey:string):void{

    let item = this.activeItem;

    this.clearAnimation()

    let groupToRemove = item.layerGroups.get(layerGroupKey)

    for (let [key,value] of Object.entries(groupToRemove)){
      this.map.removeLayer(value['layer'])
    }

    item.layerGroups.delete(layerGroupKey)

    item.layerGroups.size > 0 ? this.setLayerGroup(item.layerGroups.keys().next().value)
    : this.removeItem(item)

  };

  addOverlays():any[]{
    let markerInfo = new ol.Overlay({
        id:'geomarkerInfo',
        positioning: 'center-center',
        position: undefined,
        element: document.getElementById('geomarkerInfo'),
    });

    let startMarkerInfo = new ol.Overlay({
        id:'startmarkerInfo',
        positioning: 'center-center',
        position: undefined,
        element: document.getElementById('startmarkerInfo'),
    });

    let endMarkerInfo = new ol.Overlay({
        id:'endmarkerInfo',
        positioning: 'center-center',
        position: undefined,
        element: document.getElementById('endmarkerInfo'),
    });

    let marker = new ol.Overlay({
      id:'geomarker',
      positioning: 'center-center',
      position:undefined,
      element: document.getElementById('geomarker'),
    });

    return [marker,markerInfo,startMarkerInfo,endMarkerInfo]
  }

  setDynamicOverlays(item:Item):void{
    let geomarker = this.map.getOverlayById('geomarker')

    geomarker.setPosition(item.coordinateList[item.currentCoordinateIndex]);

    let geoMarkerInfo = this.map.getOverlayById('geomarkerInfo')

    geoMarkerInfo.setPosition(item.coordinateList[item.currentCoordinateIndex]);

    let transformedCoord = ol.proj.transform(item.coordinateList[item.currentCoordinateIndex],'EPSG:3857', 'EPSG:4326')

    let distance = item.routeDistanceList[item.currentCoordinateIndex-1]

    distance == undefined? distance = 0 :distance = item.routeDistanceList[item.currentCoordinateIndex].toFixed(0)

    geoMarkerInfo.getElement().setAttribute('data-hint',
     'Geomarker of: '+ item.type + ': '+ item.name+'\u000A' +
     'Distance traveled: '+ distance + 'M' +
     '\u000A\u000ACoordinates:\u000ALongitude: ' + transformedCoord[0].toFixed(4) +
     '\u000ALatitude: ' + transformedCoord[1].toFixed(4) +
     '\u000A\u000ACurrent DTG:' + item.datetimeList[item.currentCoordinateIndex]);
  }

  setStaticOverlays(item:Item):void{

    this.setDynamicOverlays(item);

    let startMarkerInfo = this.map.getOverlayById('startmarkerInfo')

    let startCoordTransformed = ol.proj.transform(item.startCoordinate, 'EPSG:3857', 'EPSG:4326');

    startMarkerInfo.getElement().setAttribute('data-hint',
    'Start marker of: '+ item.type + ': '+ item.name+'\u000A' +
    'Distance traveled: '+ 0 + 'KM'+
    '\u000A\u000ACoordinates:\u000ALongitude: ' +
    startCoordTransformed[0].toFixed(4) + '\u000ALatitude: ' +
    startCoordTransformed[1].toFixed(4)+
    '\u000A\u000ACurrent DTG:' + item.datetimeList[0]);


    let endMarkerInfo = this.map.getOverlayById('endmarkerInfo')

    let endCoordTransformed = ol.proj.transform(item.endCoordinate, 'EPSG:3857', 'EPSG:4326')

    endMarkerInfo.getElement().setAttribute('data-hint',
    'End marker of: '+ item.type + ': '+ item.name+'\u000A' +
    'Distance traveled: '+ item.totalRouteDistance + 'KM'+
    '\u000A\u000ACoordinates:\u000ALongitude: ' +
    endCoordTransformed[0].toFixed(4) + '\u000ALatitude: ' +
    endCoordTransformed[1].toFixed(4)+
    '\u000A\u000ACurrent DTG:' + item.datetimeList[item.datetimeList.length - 1]);
  }

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
    this.activeItem.id == item.id ? (this.clearAnimation(),
                                    this.selectItem(this.selectedItems.values().next().value))
                                    : null;


    item.layerGroups.forEach(layerGroup => {
      for (let [key,value] of Object.entries(layerGroup)){
       this.map.removeLayer(value['layer'])
      }
    });

    item.layerGroups.clear();

    /**
     * Loop trough all selected items. If the id of the item to remove == to the id
     * of the value at the current index: Remove that item using the .splice() function
     * on the selectedItems list. As parameter we pass the index on which the loo p is.
     */
    this.selectedItems.filter(
      (value, index) => value.id ==  item.id ? this.selectedItems.splice(index,1) : null)

    /**
     * If the length of the selectedItems list is 0, after removing the item:
     * Toggle the overlays of. Else the overlays are set to the new item.
     */
    this.selectedItems.length == 0 ? this.toggleOverlay('all')
                                   : this.setStaticOverlays(this.activeItem)
  }

  getItemDataByDTG(item:Item,dtg_s,dtg_e):void{
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

  /*
  Here we create a function called: "getItemDataByAmount()"

  This function is called when a amount is selected from the dropdown list related
  to the amount selection.

  This function contains a switch/case. The switch case takes the itemType,
  which in our case can be a tracker or a trail, as input. Depending on the
  itemType, the corresponding function is triggerd.

  These functions trigger a function in the service related to the item which
  is passed in the function: "getItemDataByAmount()".

  The data obtained from the function which was triggered in the service, will
  then be passed as parameter in the function: "loadItemData()". The function
  loadItemData() will then assign the returned data to the item which is passed
  as parameter in this function.
  */
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

  /*
  Here we create a function called: "getItemDataByCountry()"

  This function is called when a country is selected from the dropdown list related
  to the countrySelection.

  The coordinates of the polygone related to that country (defined in the
  global JavaScriptMap countryList) are than passed to this function.

  This function contains a switch/case. The switch case takes the itemType,
  which in our case can be a tracker or a trail, as input. Depending on the
  itemType, the corresponding function is triggerd.

  These functions trigger a function in the service related to the item which
  is passed in the function: "getItemDataByCountry()".

  The data obtained from the function which was triggered in the service, will
  then be passed as parameter in the function: "loadItemData()". The function
  loadItemData() will then assign the returned data to the item which is passed
  as parameter in this function.
  */
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

  toggleLayer(layerType:string):void{

    let layerToToggle = this.activeItem.activeLayerGroup[layerType].layer

    layerToToggle.getVisible() == true ? layerToToggle.setVisible(false)
                                      : layerToToggle.setVisible(true)
  }

  toggleOverlay(overlayType:string):void{

    let overlay = this.map.getOverlayById(overlayType);

    let item = this.activeItem;

    switch (overlayType) {
      case 'geomarkerInfo':
        overlay.getPosition() == undefined ? overlay.setPosition(item.coordinateList[item.currentCoordinateIndex])
                                           : overlay.setPosition(undefined)
        break;
      case 'startmarkerInfo':
        overlay.getPosition() == undefined ? overlay.setPosition(item.startCoordinate)
                                           : overlay.setPosition(undefined)
        break;
      case 'endmarkerInfo':
        overlay.getPosition() == undefined ? overlay.setPosition(item.endCoordinate)
                                           : overlay.setPosition(undefined)
        break;
      case 'all':
        this.map.getOverlayById('geomarker').setPosition(undefined);
        this.map.getOverlayById('geomarkerInfo').setPosition(undefined);
        this.map.getOverlayById('startmarkerInfo').setPosition(undefined);
        this.map.getOverlayById('endmarkerInfo').setPosition(undefined);
        break;
    };
  };

  setLayerStyle(layerType:string):void{
      switch (layerType) {
        case 'lineLayer':

          let newLineStyle  = new ol.style.Style({
            stroke: new ol.style.Stroke({
                width:this.widthList.get(this.styleDict['width']),
                color:this.colorList.get(this.styleDict['color']),
                lineDash:this.lineTypeList.get(this.styleDict['type'])
            }),
            zIndex: 3
          })

          this.activeItem.activeLayerGroup['lineLayer']['layer'].getSource().getFeatures()[0].setStyle(newLineStyle)

          break;

        case 'markerLayer':
          let newStartMarkerStyle  = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: `assets/img/pins/pin_s_${this.styleDict.color}.png`
            }), zIndex: 5
          })

          let newEndMarkerStyle  = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: `assets/img/pins/pin_e_${this.styleDict.color}.png`
            }), zIndex: 5
          })

          document.getElementById('geomarker').style["background-color"] = this.colorList.get(this.styleDict.color)

          this.activeItem.activeLayerGroup['markerLayer']['layer'].getSource().getFeatures()[1].setStyle(newEndMarkerStyle)

          this.activeItem.activeLayerGroup['markerLayer']['layer'].getSource().getFeatures()[0].setStyle(newStartMarkerStyle)
          break;

        case 'pointLayer':
          break;
      }
  }

  animateRoute():void{

    let _this = this;

    let speed = ( < HTMLInputElement > document.getElementById('speed')).value;

    this.activeItem.animation != undefined ? pauseAnimation()
                              : this.activeItem.animation = setInterval(function(){
                                    for (var i = 0; i < 2; i++){
                                      startAnimation()
                                    }}, parseInt(speed));
    function startAnimation(){

      _this.setDynamicOverlays(_this.activeItem)

      _this.activeItem.currentCoordinateIndex++;

      _this.activeItem.currentCoordinateIndex < _this.activeItem.coordinateList.length ? null
      : (pauseAnimation(),_this.activeItem.currentCoordinateIndex = 0)
    }

    function pauseAnimation(){

      clearInterval(_this.activeItem.animation);

      _this.activeItem.animation = undefined

    }
  }

  clearAnimation():void{

    this.activeItem.currentCoordinateIndex = 0;

    clearInterval(this.activeItem.animation);

    this.activeItem.animation = undefined;

    this.setDynamicOverlays(this.activeItem)
  }

  loadElevationData():void{

    let _this = this;

    let elevationData = this.activeItem.activeLayerGroup['lineLayer']['altitudes'];

    if (this.elevationProfileOpen){
        setTimeout(function() {
          elevationData.length != Chartist.getDataArray(
            _this.elevationProfile.data)[0].length ? _this.elevationProfile.update(
            {series: [{meta: 'Height above MSL', value: elevationData.slice(0, 1000)}]},
            {high:Math.max(...elevationData.slice(0, 1000)),
             low:Math.min(...elevationData.slice(0, 1000))},true) :  null }, 1);
    }
  }

  createElevationProfile():void{
    let tool = tooltip

    let chartData = {
        labels: [],
        series: [[0]]
    }

    let chartSettings = {
        high: 10,
        low: 0,
        axisX: {
            showGrid: false
        },
        axisY: {
            showGrid: false
        },
        showArea:true,
        showGrid: false,
        showLine: false,
        fullWidth: true,
        plugins: [
          Chartist.plugins.tooltip()
        ]
      }

    this.elevationProfile  = new Chartist.Line('.ct-chart',chartData,chartSettings);
  }
}
