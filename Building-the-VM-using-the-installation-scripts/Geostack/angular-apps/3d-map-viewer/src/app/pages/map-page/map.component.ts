/*
Here we import the default angular modules
*/
import {
	Component,
	OnInit
} from '@angular/core';

/*
Here we import the services which are used to call functions that perform
API requests to our Flask-API, which will then execute a query on our MongoDB
datastore.
*/
import {
	MapService
} from 'src/app/services/map.service'
import {
	CraneService
} from 'src/app/services/crane.service'

/*
Here we create a global constant called:"Cesium".
This constant represents the instance of the geospatial framework Cesium.
To use the build in functions of OpenLayers we first need to call this constant
*/
declare const Cesium: any;

/*
Here we create a class which defines what attributes an item is going to
have.
*/
export class Item {
	//id: The MongoID of the item
	id: string;
	//name: The name of the item
	name: string;
	//type: The item type (e.g. tracker or trail)
	type: string;
	/*timestampColumn: The name of the timestamp column in the dataset belonging
	                   to the item.*/
	timestampColumn: any;
	//totalDataLength: The total amount of transmissions or signals
	totalDataLength: number;
	//totalRouteDistance: The total length of the route
	totalRouteDistance: any;
	//layerGroups: A JavaScriptMap consisting of layerGroups each containing a
	//lineLayer, markerLayer and pointLayer.
	layerGroups: Map < string, any > = new Map();
	//activeLayerGroup: The active Layer group
	activeLayerGroup: any;
	//coordinateList: A list of coordinates
	coordinateList: any = [];
	//altitudeList: A list of altitudes
	altitudeList: any = [];
	//datetimeList: A list of DTG
	datetimeList: any = [];
	//routeDistanceList: A list of distances between datapoints
	routeDistanceList: any = [0];
	//startCoordinate: The first coordinate of the item
	startCoordinate: any;
	//endCoordinate: The last coordinate of the item
	endCoordinate: any;
	/*currentCoordinateIndex: The index in the coordinate list. This value is
	                          incremented when the animation is running.*/
	currentCoordinateIndex: number = 0;
	//animation: The instance of the interval which runs the animation
	animation: any;
	//dateRangeTotal: The start/ end date of the total route
	dateRangeTotal: any;
	//dateRangeSelected: The start / end date of the route that is visualized
	dateRangeSelected: any;
};

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
	providers: [MapService, CraneService]
})
export class MapComponent implements OnInit {

	/*
	Here we create a global variable called: "map". This is the variable
	to which the Cesium map will be assigned after it's created. Because
	of the global variable we can use the map throughout the whole component.
	*/
	public map: any;

	/*
  Here we create a global variable called: "mapTileLayer". This is the variable
  to which the baselayer containing the tiles of the map is assigned.
  We assign the elevationMaps by creating a new OpenStreetMapImageryProvider and
  passing the location of the TileStache Tileserver running behind the NGINX
  webserver as URL.

  We set the local OpenStreetMap tiles as default WMS. So when the application
  is loaded, the local OpenStreetMap tiles are loaded aswell.
 */
  public mapTileLayer:any = new Cesium.OpenStreetMapImageryProvider({
    url : 'http://localhost/tiles/openstreetmap-local/'
  });

  /*
  Here we create a global variable called: "mapTerrainLayer". This is the
  variable to which the baselayer containing the elevationMaps is assigned.
  We assign the elevationMaps by creating a new CesiumTerrainProvider and
  passing the location of the Cesium Terrain Server running behind the NGINX
  webserver as URL.

  We set the local Hamert DSM files as default Terrain files.
  So when the application is loaded, the local (DTM) terrain files of the
  Hamert are loaded aswell.
 */
  public mapTerrainLayer:any =  new Cesium.CesiumTerrainProvider({
    url : 'http://localhost/terrain/M_52EZ2'
  });

	/*
	Here we create a global variable called: "mapProviders". The variable
	is a javascript map which will contain key|values. The javascript map will be
	populated with available map providers once the function:"getMapProviders()"
	is triggered.
	*/
	public mapProviders: Map < any, any > = new Map();

	/*
	Here we create a global variable called: "items". The type of the variable
	is a list of Items. This list starts of empty, but when we call the function(s)
	that retrieve the trackers and routes from the datastore, the emtpy list will
	be populated with these results.
	*/
	public items: Item[] = [];

	/*
	Here we create a global variable called: "selectedItems".
	The type of the variable is a list of Items. This list starts of empty,
	but when we select an item form the dropdown box in the application the
	function: "selectItem()" will be triggered.

	This function will then add the selected item to the selectedItems list.
	*/
	public selectedItems: Item[] = [];

	/*
	Here we create a global variable called: "activeItem".
	When an item is selected using the function: "selectItem()"
	the item will become the activeItem.
	*/
	public activeItem: Item = new Item();

	/*
	Here we create a global variable called: "dateRange". The value of this
	variable is passed to the DateTimePicker Component. The default value is
	0 but will change when an item is selected.
	*/
	public dateRange: any = [0, 0];

	/*
	Here we create a global variable called: "countryList".

	The type of this variable is a JavaScriptMap which contains the polygon
	coordinates of countries in which you can select transmissions or signals.
	The items in this JavaScriptMap will populate the dropdown list related
	to the country selection.

	If you want to add more countries to this dropdown list you can navigate to
	the website:
	https://www.keene.edu/campus/maps/tool/

	On this website you can select a polygon and get the coordinates of the
	selected polygon.

	The you can copy paste these coordinates in this JavaScriptMap and give a
	suitable name to the new entry.
	*/
	public countryList: Map < string, Number[][] > = new Map([
		["Spain", [
			[-10.6347656, 44.3081267],
			[-11.0961914, 36.3859128],
			[1.9995117, 36.7740925],
			[3.4716797, 43.7869584],
			[-10.6347656, 44.3081267]
		]],
		["Netherlands", [
			[3.1750488, 53.6055441],
			[2.9992676, 50.8336977],
			[6.3391113, 50.7086344],
			[7.3168945, 53.5794615],
			[3.1750488, 53.6055441]
		]],
	]);

	/*
	Here we create the class constructor of the MapComponent. We pass the map and
	CraneServices in the constructor. We assign the services to a fitting variable,
	this variable can be reused throughout the whole component. We use these
	variables to call the functions in our services which will then perform API
	calls to our Flask-API.
	*/
	constructor(private _MapService: MapService,
		private _CraneService: CraneService) {}

	/*
	Here we create the ngOnInit() function. All the logic in this function will
	be executed when the component is loaded.
	*/
	ngOnInit() {
		this.getItems();
		this.createCesiumMap();
	};

	/*
	Here we create the function to retrieve all the WMS entries in our Tilestache
	configuration.This function triggers the function getTilestacheEntries() in
	the MapService. Then it populates the mapProviders JavaScriptMap with all the
	obtained entries.

	If an entry is empty ( equal to ""), the entry will not be added to the
	JavaScriptMap.
	*/
	getMapProviders(): void {
		this._MapService.getTilestacheEntries().subscribe(
			(providers: []) => (
				providers.forEach(provider => {
					provider != "" ? this.mapProviders.set(provider, provider) : null;
				})
			)
		)
	};

	/*
  Here we create a function called: "setMapProvider()".

  This function is used to switch between the map providers which are served
  by our TileStache Tileserver.

  This function is bound to the buttons (related to switching between map
  providers) which are defined in the HTML layout of the MapComponent.

  The function takes a providerKey as input parameter. The providerKey is the
  name of the entry that is clicked by the user when selecting a mapProvider
  from the dropdown list in the application.This providerKey is the key of the
  entry in the javascript map: "mapProviders".

  The following steps are executed when the function is triggered:

  1) Obtain the current imageryLayers from the Cesium map.

  2) Remove all the current imageryLayers from the Cesium map.

  3) Create a new OpenStreetMapImageryProvider and set the URL of the
     imageryProvider using the providerKey that was passed as parameter on the
     function call. We assign the newly created imageryProvider to the global
     variable: "mapTileLayer".

  4) Add the newly created imageryProvider to the Cesium map.
 */
  setMapProvider(providerKey):void{

    // Here we obtain the current imageryLayers from the Cesium Map.
    var layers = this.map.scene.imageryLayers;

    // Here we remove all the current imageryLayers from the Cesium Map.
    layers.removeAll();

    // Here we create a new OpenStreetMapImageryProvider to which we assign
    // the URL to our TileStache Server running behind the NGINX webserver.
    // We use the providerKey to determine which WMS should be used.
    this.mapTileLayer = new Cesium.OpenStreetMapImageryProvider({
        url : "http://localhost/tiles/"+providerKey+"/"
    });

    // Here we add the new imageryLayer to the Cesium Map.
    layers.addImageryProvider(this.mapTileLayer);
  };

	/*
  Here we create a function called: "createCesiumMap()".

  This function is used to create the Cesium Map instance which is also known
  as the Cesium Viewer.

  The function is triggered in the function: "ngOnInit()" to make sure
  that the Cesium Map (Viewer) is created when the MapComponent is loaded.

  The map instance will be created in the HTML div element with the id:'map'.
  This div element is defined in the HTML layout of the MapComponent which can
  be found in the file: "map.component.html".

  The following steps are executed when the function is triggered:

  1) Trigger the function:"getMapProviders()" which is used to obtain all the
     available WMS's (WebMapServers) which are defined in our TileStache
     configuration file.

  2) Optional: Assign your Cesium ION Token key to the Cesium instance.

  3) Create a new Cesium Map instance (Viewer) to which we assing the
     global variable:"mapTileLayer" as imageryProvider (tile layer) and
     the global variable:"mapTerrainLayer" as terrainProvider
     (Elevation map layer)

  4) set allowDataSourcesToSuspendAnimation to false to make sure that when
     an animation is started it will not stop when a Terrain file or Tile is
     loaded.
 */
  createCesiumMap():void{
    // Here we trigger the function:"getMapProviders()" to obtain all the
    // available WMS's.
    this.getMapProviders()

    // Here we assign the Cesium ION Token to the Cesium instance.
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNjRmNmUyNS1hNTE1LTRkNGItOGE0Mi0yMzM0ODVkZjU4MjYiLCJpZCI6MjgxMTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTA2NjE2MTh9.3MM9tuFDdgQFM6e_-kw5ZIXreBP5cdb83YsDBTgRYBQ';

    // Here we create a new Cesium Map instance (Viewer). We pass the id ('map')
    // of the div element in the HTML layout in which the Viewer will be added.
    this.map = new Cesium.Viewer('map',
     {
        // Here we assign the mapTileLayer as imageryProvider.
        imageryProvider: this.mapTileLayer,
        // Here we assign the mapTerrainLayer as terrainProvider.
        terrainProvider: this.mapTerrainLayer,
      });

    // Here we make sure that animations are not stopped when a data object
    // is loaded.
    this.map.allowDataSourcesToSuspendAnimation = false;
  };

	/*
  Here we create a function called: "zoomToLocation()"

  This function is assigned to the button: "Zoom to start", defined in the
  HTML file of the MapComponent.

  The function gets the Cesium Viewer Scene and animates it to move to the start
  coordinates of the item on which the: "zoom to start marker" button is clicked.

  We use the build in Cesium function called: ".flyTo()" to zoom to a
  given location.

  In this function we set the destination to which has to be zoomed to
  the start longitude and latitude coordinates of the active Item.

  We also set the duration which defines the amount of time (in seconds) it
  takes for the animation to complete.
 */
  zoomToLocation():void{

    // Here we obtain the Cesium Viewer Scene camera an call the function:
    // "flyTo" on the camer.
    this.map.scene.camera.flyTo({
      // Here we set the destination to a Cartesian3 in which we pass the
      // longitude, latitude and a predefined altitude value (1000).
      // The higher the altitude value the more zoomed out the map will be.
      destination: Cesium.Cartesian3.fromDegrees(
        this.activeItem.startCoordinate[0],
        this.activeItem.startCoordinate[1],
        1000),
      // We set the duration of the animation to 3 seconds.
      duration: 3,
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
	- itemType : The itemType, this is necessary because we want to be able to
	             visualize multiple types of datasets such as trackers and trails.
	- itemRouteLength : The total amount of transmissions / signals belonging to
	                    the tracker / trail that is added.
	- itemTimeColumn : The name of the timestamp column in the dataset. This is
	                   required since the column name representing the timestamp
	                   differs in each dataset.
	- itemDTG : The total time frame of the route, this is NOT the time frame of the
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
	addItem(itemId, itemName, itemType, itemRouteLength, itemTimeColumn, itemDTG): void {

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

	This function is triggered in the ngOnInit() function. This function triggers
	the function: "getTrackers()" in our CraneService file, which then returns
	all the trackers in our MongoDB datastore.

	The syntax used in the function is as follows:

	this.{service}.{function}.subscribe({elements} =>
	  {elements}.forEach({element} =>{
	    addItem(element values)
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
	getItems(): void {
		this._CraneService.getTrackers().subscribe(
			(trackers: []) => (
				trackers.forEach(tracker => {
					this.addItem(
						tracker['_id']['$oid'], tracker['name'], 'tracker',
						tracker['transmission_Count'], 'timestamp',
						[tracker['start_date']['$date'], tracker['end_date']['$date']],
					);
				})
			)
		);
	};

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

		// Here we return the valid datetime as string.
		return time;
	};

	/*
	Here we create a function called: "selectItem".

	This function is triggered when one of the items in the ItemList is clicked in
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

		 If this is the case the selected item's layerGroup will become the
		 activeLayerGroup using the function: addLayerGroup().

		 If the itemId, of the item that is being selected, is not in the list of
		 selectedItems the following will happen:

		 1) The function: "getInitalItemData()" will be triggered. In the function
				the item will be passed. This function will retrieve the first 100
				transmissions / signals belonging to that item.

		 2) The item is added to the selectedItems list.

	3) The dateRange (The start and end date in the DTG picker) global
 	   variable is changed to the dateRangeTotal of the selected item.

 	4) Since the selected item is now the activeItem, the overlays
 		 (the information popups) will be filled with the information of
 	   the item that is currently active (The item that was selected), using the
 	   function setStaticOverlays().

	*/
	selectItem(item: Item): void {

		// Here we set the global variable activeItem to be the selected item.
		this.activeItem = item;

		// Here we check if the item which is selected has been selected before.
		this.selectedItems.filter(
				data => data.id.includes(item.id)).length == 1 ?
				this.addLayerGroup(this.activeItem) :
				(this.getInitalItemData(item), this.selectedItems.push(item))

		// Here we make sure that the dateRange in the NgbCalendar is updated
		// with the dateRange of the selectedItem.
		this.dateRange = this.activeItem.dateRangeTotal;

	};

	/*
	Here we create a function called: "getInitalItemData()"

	This function is called in the function: "selectItem()", if the item has not
	been selected yet. The item from which the data has to be retrieved is then
	passed as parameter in this function.

	This function contains a switch/case. The switch case takes the itemType,
	which in our case can be a tracker or a trail, as input. Depending on the
	itemType, the corresponding function is triggered.

	These functions trigger a function in the service related to the item which
	is passed in the function: "getInitalItemData()".

	The data obtained from the function which was triggered in the service, will
	then be passed as parameter in the function: "loadItemData()". The function
	loadItemData() will then assign the returned data to the item which was
	selected in the function: "selectItem()"
	*/
	getInitalItemData(item: Item): void {
		switch (item.type) {
			case 'tracker':
				this._CraneService.getTransmissionsID(item.id).subscribe(
					(transmissions) => {
						this.loadItemData(transmissions)
					}
				);
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

	2) Check wether the data passed as parameter is not empty. If the data is empty
	   the function will return because there is no data to be loaded.

	3) Set the value of the coordinateList belonging to the item to an empty list.

	4) Set the value of the altitudeList belonging to the item to an empty list.

	5) Set the value of the datetimeList belonging to the item to an empty list.

	6) Execute a forEach loop on the ItemList, the foreach loop does the following
		 for all the rows in the list of data:

		 6.1) Obtain the value of the coordinates and add each coordinate to
		      the coordinateList belonging to the item.

		 6.2) Obtain the value of the altitude column and append it to the
					altitudeList belonging to the item.

		 6.3) Obtain the value of the timestamp column and append it to the
					datetimeList belonging to the item.

	7) Assign the first value of the coordinateList (the value at index 0) to
		 the variable: "startCoordinate".

	8) Assign the last value of the coordinateList (the value at index length
		 of the datalist passed as parameter - 1) to the variable endCoordinate.

	9) Create a list containing the first item in the datetimeList and the last
		 item of the datetimeList, created in step 6.3, and assign it to the
		 variable: "dateRangeSelected".

	10) Trigger the function: "addLayerGroup()", and pass the activeItem as
		 parameter. The function: "addLayerGroup()" wil then create the first
		 layerGroup.
	*/
	loadItemData(data: any[]): void {
		// Here we assign the activeItem to a variable called item
		let item = this.activeItem;

		// Perform a check to see if the data passed as parameter is bigger than
		// 0. If this is the case, no item data will be loaded.
		if (data.length == 0){
			return;
		}

		// Here we create empty lists to which we are going to append the data.
		item.coordinateList = [];
		item.altitudeList = [];
		item.datetimeList = [];

		// Here we create a foreach loop which loops through all the rows in the data
		data.forEach(row => {

			// Here we add the coordinates to the coordinate list.
			item.coordinateList.push(row.geometry.coord.coordinates);

			// Here we add the altitude values to the altitude list.
			item.altitudeList.push(row.geometry.alt);

			// Here we add the DTG values to the datetimeList we pass the value of
			// the item.timestampColumn to obtain the value of this column.
			item.datetimeList.push(row[item.timestampColumn].$date);
		});

		// Here we add the first entry in the coordinateList as startCoordinate
		item.startCoordinate = item.coordinateList[0];

		// Here we add the last entry in the coordinateList as endCoordinate
		item.endCoordinate = item.coordinateList[data.length - 1];

		// Here we set the last and the first values of the timestamp columns as
		// start and end date of the selected route.
		item.dateRangeSelected = (
			this.timeConverter(data[0][item.timestampColumn]['$date']) + '/' +
			this.timeConverter(data[data.length - 1][item.timestampColumn]['$date'])
		);

		// Here we create a new layerGroup and add the item as parameter.
		this.addLayerGroup(item);
	};

  /*
	Here we create a function called: "addLayerGroup()".

	This function is used to create the datapoints which will be added to the
	Cesium map.

	The function: “addLayerGroup()’is triggered in the function:”loadItemData()”
	to make sure a layerGroup is created each time new data is selected.
  The following steps are executed when the function:”addLayerGroup” is
	triggered:

    1) We assign the value of "this" to a variable called: "_this". We need to
			 do this when we want to use global variables in an nested function.
			 A nested function is a function inside another function.

    2) We assign the Cesium Map (Viewer) instance to a variable called:”viewer”.
			 We do this so we can simply write viewer instead of this.map.

    3) We create an empty list called:”lineLayer” to which we are going to add
		   all the datapoints and entities after the have been created.

    4) We assign the value of the dateRangeSelected selected to the variable
		   called: "layerGroupSelector". We do this because the keys (which can be
			 seen as the unique identifier of the layerGroup) in the JavascriptMap are
			 the dateRangeSelected values of each layerGroup.

       We are going to use the variable: "layerGroupSelector" to select, edit
			 and remove specific layerGroups later.

    5) A check is performed to see whether a layerGroup with that key
		   (the dateRangeSelected value) already exists in the JavascriptMap:
			 "layerGroups" to make sure we do not add the same datapoints twice.

       If this is the case ( so the layerGroupSelector already exists) the
			 selected item's layerGroup will become the activeLayerGroup.

       If this is NOT the case the following steps will be executed:

    6) We obtain and transform the start date of the visualized route into a
		   valid format which is understandable for the Cesium Viewer clock
			 (The animation tool).

    7) We obtain and transform the end date of the visualized route into a
		   valid format which is understandable for the Cesium Viewer clock
			 (The animation tool).

    8) We calculate the difference (in seconds) between the start and end date
		   of the visualized route.

    9) We add the difference in seconds to the start date of the visualized
		   route. We do this because we need the result of this to determine when
			 the animation is finished.

    10) We set the settings of the Cesium Viewer Clock (Animation tool) to
		    contain the following settings:
        I. Set the start time of the clock to the start date of the route.

        II. Set the stop time of the clock to the stop date of the route which
				    was calculated by adding the difference (in seconds), between the
						start and end date, to the start date.

        III. Set the current time of the clock to the start date of the
				     visualized route.

        IV. Set the range of the clock to the start and end date of the
				    visualized route.

        V. Set the clock multiplier (the default speed in which the animation
				   is played) to x200.

        VI. Set the range of the timeline at the bottom of the Cesium Viewer to
				    the start date and stop date of the visualized route.

    11) Create a nested function called:”generateDataPoints” which is used to
		    create the datapoints (black circles on the map) using the coordinates
				from the item’s coordinateList and the altitudes from the item’s
				altitudeList.

        The following steps are executed in the nested function:
				’generateDataPoints()’:

        I. Create a new instance of a Cesium SampledPositionProperty which is an
				   object which has an longitude, latitude and altitude.

        II. Create a for loop which loops an amount of times equal to the amount
				    of entries in the item’s coordinateList. We are going to create a
						datapoint for each of the entries in the coordinateList.
						The following steps are executed in the for loop (so on each of the
						datapoints):
            ▪ Create a new Cesium Julian Date which represents the date on when
						  the datapoint was reached. We assign the created date to a
							variable called: “timeOfDataPoint”.
            ▪ Calculate the difference (in seconds) between the start date and
						  the date the datapoint was reached.
            ▪ Create a new Cesium Julia Date by adding the calculated difference
						  (in seconds), between the start date and the date the datapoint was
							reached, to the start date of the visualized route. We do this
							because we need to know how long it took for the entity to reach
							the datapoint. We assign the result to a variable called:”time”.
            ▪ Create a new Cartesian3 instance in which we pass the longitude,
						  latitude and altitude values of the datapoint. Cartesian3 is used
							in Cesium to create the position of a datapoint using the longitude,
							latitude and altitude values of the datapoint. We assign the result
							to a variable called:”position”.
            ▪ Add a sample to the property object which was created in step 11.I.
						  We pass the calculated time difference as first parameter (time)
							and the Cartesian3 (position) as second parameter.
            ▪ Create a new entity for each datapoint. We set the position of the
						  entity to the Cartesian3 (position) which was created earlier.
            ▪ Add the created entity to the list called: “lineLayer” which was
						  created in step 3.

        III. Return the created property after the for loop is finished executing.
				     The property will contain a multiple samples which each represent a
						 datapoint.

    12) Trigger the nested function: “generateDataPoints()” which was created in
		    the previous step. As mentioned earlier; the function generateDataPoints()
				will return a property containing samples (which each represent a datapoint).
				We assign the result (the returned property) of the function:
				”generateDataPoints()” to a variable called: “position”.

    13) Create an new entity (which represents the Yellow line / Crane). We set
		    the following values for the entity:

        I. We set the name of the entity to the name of the item which is
				   visualized (e.g. Agnetha)

        II. We set the availability of the entity (the time range in which the
				    entity should be displayed on the map) to the startDate and stopDate
						of the visualized route.

        III. We set the position of the entity to the positions generated by the
				     function:”generateDataPoints()” in step 12.

        IV. We set the orientation of the entity using a build-in cesium function
				    called: “VelocityOrientationProperty” in which we pass the positions
						obtained in step 12. This makes sure that the entity moves to the
						correct position when animating.

        V. Create the entity path (Which is the actual yellow line).

    14) Set the interpolation options of the entity. We are going to use an
		    interpolation algorithm to make sure the yellow line moves smoothly
				when animating. The illustrations below show what it will look like
				without (left illustration) and with (right illustration) an
				interpolation algorithm:

		15) Add the newly created entity to the list: ‘lineLayer’.

    16) Add the newly created layerGroup to the item’s layerGroups.

	*/
	addLayerGroup(item: Item): void {

	    // Assign this (used to access global variables) to a variable called:
	    // _this. We do this because we are going to create nested functions
	    // in which we want to access global variables.
	    let _this = this;

			// Here we assign the Cesium Map (viewer) instance to a variable called
			// "viewer". We do this so we don't need to write this.map all the time.
			let viewer = this.map

			// Here we create an empty list called: "lineLayer" to which we are
			// going to add all the entities after the have been created.
			let lineLayer = [];

	    // Here we set the layerGroupSelector to be the range (Start date ->
	    // End date) of the route. The layerGroupSelector can be seen as the
	    // unique identifier of the layerGroup.
	    let layerGroupSelector = item.dateRangeSelected;

	    // Here we perform a check to see if the layerGroup already exists
	    // since we don't want to add it twice. If this is not the case (so
	    // the layerGroup does not exist yet) the following code is executed.
	    if (!item.layerGroups.has(layerGroupSelector)) {

	        // Here we create a new Cesium JulianDate which is the Date format
					// used by the Cesium Clock (Animation tool). We obtain the first
					// entry in the items datetimeList (At index 0) and assign it to a
					// variable called: "startDate".
	        let startDate = Cesium.JulianDate.fromDate(
						new Date(item.datetimeList[0]));

					// Here we do the same as above but then for the endDate. We obtain
					// the last item entry in the datetimeList (list length - 1) and
					// assign it to a variable called: 'endDate'.
					let endDate = Cesium.JulianDate.fromDate(
						new Date(item.datetimeList[item.datetimeList.length - 1]));

					// Here we calculate the difference (in seconds) between the start
					// and end date of the visualized route. We do this by passing the end
					// and start dates as parameters.
					let startEndDiff = Cesium.JulianDate.secondsDifference(
						endDate,startDate)

					// Here we create the date of when the route is finished. We do this
					// by adding the difference in seconds (calculated above) to the
					// startDate (The first date in the datetimeList).
	        let stopDate = Cesium.JulianDate.addSeconds(
	            startDate, startEndDiff,
	            new Cesium.JulianDate());

	        // Below we set the options of the Cesium clock (animation tool)
					// Here we set the Start DTG of the clock to the startDate.
	        viewer.clock.startTime = startDate.clone();
					// Here we set the Stop DTG of the clock to the stopDate.
	        viewer.clock.stopTime = stopDate.clone();
					// Here we set the current time of the clock to the startDate.
	        viewer.clock.currentTime = startDate.clone();
					// Here we set the option so that the clock loops to the startDate if
					// it reaches the stop Date
	        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
					// Here we set the default clock multiplier to 200. This is the
					// default speed in which the animation is played.
	        viewer.clock.multiplier = 200;
					// Here we set the range of the timeline at the bottom of the Cesium
					// viewer to the start and stopDate.
	        viewer.timeline.zoomTo(startDate, stopDate);

	        // Here we create a nested function called:"generateDataPoints()".
					// This function will create the datapoints (shown as black circles)
					// before the route is animated.
	        function generateDataPoints() {

							// Here we create a new instance of a SampledPositionProperty
							// which we assign to a variable called: "property".
	            var property = new Cesium.SampledPositionProperty();

							// Here we create a for loop which loops an amount of times equal
							// to the amount of entries in the coordinateList.
	            for (var i = 0; i < item.coordinateList.length - 1; i++) {

									// Here we create a new JulianDate representing the DTG on
									// which the datapoint was reached. We pass the value of i (
									// the value on which the loop currently is) to determine what
								  // value needs to be obtained from the list.
								  let timeOfDataPoint = Cesium.JulianDate.fromDate(
										new Date(item.datetimeList[i]));

									// Here we calculate the difference in seconds between the
									// start Date an the date when the datapoint was reached.
									let timeDiff = Cesium.JulianDate.secondsDifference(
										timeOfDataPoint,startDate)

									// Here we add the difference in seconds to the startDate to
									// determine how long it took before the datapoint was reached.
	                let time = Cesium.JulianDate.addSeconds(startDate, timeDiff,
										new Cesium.JulianDate());

									// Here we create a new Cartesian3 in which we pass the
									// longitude (on the first position of the coordinateList
									// entry), latitude (on the second position of the
									// coordinateList entry) and the latitude.
	                var position = Cesium.Cartesian3.fromDegrees(
	                    item.coordinateList[i][0],
	                    item.coordinateList[i][1],
	                    item.altitudeList[i] + 10);

									// Here we add a new sample to the Cesium
									// SampledPositionProperty in which we pass the calculated time
									// and the position.
	                property.addSample(time, position);

									// Here we create the entities for each of the datapoints.
	                let entity = viewer.entities.add({
										  // we set the position of each entity to the position
										  // created earlier.
	                    position: position,
											// We add a point to the entity (the black circle)
	                    point: {
												  // We set the size (pixel size) to 10 pixels.
	                        pixelSize: 10,
													// We set the color (the fill color) to transparent.
	                        color: Cesium.Color.TRANSPARENT
	                    }
	                });

									// Here we add the created entity to the lineLayer list.
	                lineLayer.push(entity)
	            }
							// Here we return the created SampledPositionProperty.
	            return property;
	        };

					// Here we trigger the nested function: "generateDataPoints()" and
					// assign the result to a variable called: "position".
	        let position = generateDataPoints();

	        // Here we create the entity (yellow line)
	        let entity = viewer.entities.add({

							// We set the entity's name to the name of the the item.
	            name: item.name,

	            // We set the entity availability to the same interval as the
							// startDate and stopDate.
	            availability: new Cesium.TimeIntervalCollection(
								[new Cesium.TimeInterval({
	                start: startDate,
	                stop: stopDate
	            })]),

	            // We set the position of the entity to the positions generated
							// by the function generateDataPoints().
	            position: position,

	            // We Automatically compute the orientation based on position
							// movement.
	            orientation: new Cesium.VelocityOrientationProperty(position),

	            // Here we add the entity path (which is the yellow line
							// representing) the entity.
	            path: {
								  // We set the leadTime (the amount of seconds the line should
								  // move infront of the entity) to 0 seconds.
	                leadTime: 0,
									// We set the trailTime (the amount of seconds) the line
									// should trail behind the entity) 12000 seconds.
	                trailTime: 200*60, // 200 minutes, in seconds of simulation time
									// We set the line resolution to 100 pixels.
	                resolution: 100,
									// We set the lineStyling to a PolylineGlowMaterialProperty
									// (glowing line).
	                material: new Cesium.PolylineGlowMaterialProperty({
										  // We set the glowPower to 0.1 (The higher the number the
										  // more then line glows).
	                    glowPower: 0.1,
											// We set the line color to yellow.
	                    color: Cesium.Color.YELLOW
	                }),
									// We set the width of the line to 10 pxiels.
	                width: 10
	            },
	        });

					// Here we add the interpolation options to the entity.
	        entity.position.setInterpolationOptions({
						  // We set the interpolation degree to 2 (the higher the less sharp
						  // the corners are when the entity turns. )
	            interpolationDegree: 2,
							// We set the interpolation algorithm to:
							// "LagrangePolynomialApproximation".
	            interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
	        });

					// Here we add the entity to the list: "lineLayer".
	        lineLayer.push(entity)

					// Here we add the newly created layerGroup to the item's layerGroups.
	        item.layerGroups.set(layerGroupSelector, {
						'lineLayer': {
							// We set the lineLayer as layer property.
							'layer':lineLayer,
							// We set the layer's start date as stopDate property.
							'startDate':startDate,
							// We set the layer's stop date as stopDate property.
							'stopDate':stopDate,
							// We set the  coordinateList as datapoints.
							'datapoints': item.coordinateList
						}
					})
	    };

			// Here we set the newly created layerGroup to be the active layergroup.
			this.setLayerGroup(layerGroupSelector);
	};

	/*
		Here we create a function called: "setLayerGroup()".

		This function is triggered in the following functions:

		1) removeLayerGroup(), when removing the currect active layer group we need to
		   set the next selected layer group to be the active layer group.

		2) addLayerGroup(), when a layer group is added we need to set the added
		   layer group to be the activeLayerGroup

		This function is used to set the active layer group and update the Cesium
		Viewer Clock according to the select layer group values (Start and stop date)

		The following steps are executed when the function is triggered:

		    1) Assign the activeItem to a variable called item.

		    2) Assign the Cesium Map Viewer instance to a variable called viewer.

		    3) Set the item’s daterange to the groupKey which is passed as input
				   parameter on the function call.

				4) Set the item’s activeLayerGroup to the newly selected layergroup.

		    5) Set the item’s coordinateList to the layerGroup's datapoints.

			  6) Set the item’s startCoordinate to the layerGroup's startCoordinate.

		    7) Set the Cesium Clock start time to the layerGroup's start date.

		    8) Set the Cesium Clock end time to the layerGroup's stop date.

		    9) Set the Cesium Clock currentTime to the layerGroup's start date.

		    10) Set the Cesium Timeline range to the interval between the item’s
				    start time and stop time.
	*/
	setLayerGroup(groupKey: string): void {

		// Here we assign the activeItem to a variable called: "item".
		let item = this.activeItem

		// Here we assign the Cesium Map Viewer instance to a variable called:
		// "viewer".
		let viewer = this.map;

		// Here we assign the groupKey (passed as input parameter) as the item's
		// selected date range (start -> end date).
		item.dateRangeSelected = groupKey;

		// Here we set the items activeLayerGroup to the layerGroup from which
		// the key was passed as parameter.
		item.activeLayerGroup = item.layerGroups.get(groupKey)

		// Here we set the items coordinateList to the datapoints of the newly
		// selected layerGroup.
		item.coordinateList = item.activeLayerGroup.lineLayer.datapoints

		// Here we set the item's startCoordinate to the first datapoint of the
		// newly selected layerGroup.
		item.startCoordinate = item.activeLayerGroup.lineLayer.datapoints[0]

		// Below we set the options of the Cesium clock (animation tool)
		// Here we set the Start DTG of the clock to the startDate of the newly
		// selected layerGroup.
		viewer.clock.startTime = item.activeLayerGroup.lineLayer.startDate.clone();

		// Here we set the Stop DTG of the clock to the stopDate of the newly
		// selected layerGroup.
		viewer.clock.stopTime = item.activeLayerGroup.lineLayer.stopDate.clone();

		// Here we set the current time of the clock to the startDate of the newly
		// selected layerGroup.
		viewer.clock.currentTime = item.activeLayerGroup.lineLayer.startDate.clone();

		// Here we set the range of the timeline at the bottom of the Cesium
		// viewer to the start and stopDate of the newly selected layerGroup.
		viewer.timeline.zoomTo(item.activeLayerGroup.lineLayer.startDate,
			item.activeLayerGroup.lineLayer.stopDate);
	};

	/*
	Here we create a function called: "removeItem()"

	This function is assigned to the delete button (icon) next to each item in the
	list of selectedItems. The item on which the delete button is clicked is then
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

	   If this is the case all overlays (information popups) will be toggled off.

	   If this is NOT the case the overlays will be placed in the position of the
	   new activeItem which was set in step 1.
	*/
	removeItem(item: Item): void {

		// Here we check if the itemId of the item to remove is the same as the
		// id of the item that is currently activeItem. If this is the case we
		// change the activeItem to the next item in the selectedItem's list.
		this.activeItem.id == item.id ? (
				this.selectItem(this.selectedItems.values().next().value)) :
			null;

		// Here we loop through each of the item's layerGroups.
		item.layerGroups.forEach(layerGroup => {
			// For each entry in the in the in the item's layerGroups JavaScriptMap
			// the following code is executed.
			for (let [key, value] of Object.entries(layerGroup)) {
				// We obtain the value of the layerGroup property: "layer" which
				// contains the list of entities belonging to the layerGroup.
				value['layer'].forEach(entity => {
					  // Here we remove each entity in the list of entities from the
						// Cesium Map.
						this.map.entities.remove(entity)
				});
			}
		});

		// Here we clear all the layerGroups from the JavaScriptMap: "layerGroups".
		item.layerGroups.clear();

		/*
		 Filter the list of selectedItems to find the item which needs to be
		 removed. If the id of the item to remove is equal to the id
		 of one of the items in the selectItems list, the item is removed using
		 the .splice() function on the selectedItems list.
		 As parameter we pass the index on which the item to remove was found in
		 the selectedItems list.
		 */
		this.selectedItems.filter(
			(value, index) => value.id == item.id ? this.selectedItems.splice(index, 1) : null)
	};

	/*
	Here we create a function called: "getItemDataByDTG()"

	This function is triggerd in the function: "getDTGEvent()" and is used to
	obtain all the datapoints from a certain item in a given timeframe.
	This function takes 3 input parameters which are as follows:
	1) An item from which the data has to be obtained;
	2) A Start date
	3) An End date

	This function triggers the function: "getTransmissionsDTG" in the CraneService
	which will then perform an API call to the Flask-API to obtain all the data
	between the given timeframe from the MongoDB datastore.

	All the data between the start and end date will be returned and passed in the
	the function: "loadItemData()".

	This function contains a switch/case. The switch case takes the itemType,
	which in our case can be a tracker or a trail, as input. Depending on the
	itemType, the corresponding function is triggered.The switch/case can be
	extended in case you want to add the functionality for other Dataset types.
	*/
	getItemDataByDTG(item: Item, dtg_s, dtg_e): void {

		// Here we define the switch/case
		switch (item.type) {
			// In case the item.type is equal to 'tracker', the following code is
			// executed.
			case 'tracker':
			  // Here we trigger the function: "getTransmissionsDTG" in the CraneService
				// we pass the itemId, Start Date and End Data as parameters and subscribe
				// the result to a variable called: "transmissions" which is then passed
				// in the function: "loadItemData()"
				this._CraneService.getTransmissionsDTG(item.id, dtg_s, dtg_e).subscribe(
					(transmissions) => {
						this.loadItemData(transmissions)
					}
				)
				break;
			default:
				break;
		}
	};

	/*
	Here we create a function called: "getDTGEvent()" which
	takes an itemId and the the emitted event (noted as $event) as input parameters.

	The function will be assigned to the DatePickerComponent which is defined in
	the HTML page of the MapComponent.

	The following steps are executed in this function:

	1) The start date (send by the DatePickerComponent) is extracted and
	   transformed in a format which is understandable for the MongoDB query
		 that will be triggered in our Flask-API.

	2) The end date (send by the DatePickerComponent) is extracted and
	   transformed in the same manner as the startDate.

	3) The function: "getItemDataByDTG()" is triggerd in which we pass the
	   activeItem, the transformed startDate and the transformed endDate as
		 parameters. The function:"getItemDataByDTG()" will then use the Start and
		 EndDate to obtain the data from the MongoDB datastore.

	*/
	getDTGEvent(id: string, $event): void {

		// Here we obtain and transform the start date.
		let dtg_s = $event[0].year + '-' + $event[0].month + '-' + $event[0].day

		// Here we obtain and transform the end date.
		let dtg_e = $event[1].year + '-' + $event[1].month + '-' + $event[1].day

		// Here we trigger the function: "getItemDataByDTG".
		this.getItemDataByDTG(this.activeItem, dtg_s, dtg_e)
	};

	/*
	Here we create a function called: "removeLayerGroup()".

	This function is triggered when the red button next to a selectedLayerGroup
	is clicked.

	This function first clears the running animation, which will only happen if
	an animation is running.

	Then the function will remove each layer in the layerGroup from the map.

	After the layers of the layerGroup are removed the layerGroup itself is removed
	from the JavaScriptMap called: "layerGroups".

  Finally a check is performed to see if the layerGroup that is removed was
  the last layerGroup in layerGroups JavaScriptMap. If this is the case, the
  function: removeItem() is called since we want to remove the item which does
  not have any selectedLayerGroups. If this is NOT the case the next layerGroup
  in the layerGroups JavaScriptMap will become the active layerGroup.

	*/
	removeLayerGroup(layerGroupKey: string): void {

    // Here we assign the activeItem to a variable called: "item"
		let item = this.activeItem;

    // Here we obtain the layerGroup which has to be removed from the
    // layerGroups JavaScriptMap using the layerGroupKey passed as parameter
    // on the function call. We assign the layerGroup to a variable called:
    // "groupToRemove".
		let groupToRemove = item.layerGroups.get(layerGroupKey)

		// For each entry in the groupToRemove's dictionary (which contains the
	  // layer entities, layer start date, layer end date and the layers datapoints)
		// the following code is executed.
		for (let [key, value] of Object.entries(groupToRemove)) {
			// We obtain the value of the layerGroup property: "layer" which
			// contains the list of entities belonging to the layerGroup.
			value['layer'].forEach(entity => {
					// Here we remove each entity in the list of entities from the
					// Cesium Map.
					this.map.entities.remove(entity)
			});
		};

    // Here we remove the layerGroup from the JavaScriptMap containing the
    // selected layerGroups. We do this by calling the: ".delete()" function
    // on the JavaScriptMap and passing the layerGroupKey as parameter.
		item.layerGroups.delete(layerGroupKey)

    // Here a check if performed to see if the size of the layerGroups JavaScriptMap
    // is bigger than 0.
    //
    // If this is the case, it means that there is/are one or more other selected
    // layerGroups, so one of these will be set as activeLayerGroup using the
    // function: "setLayerGroup" and passing the value of the key
    // (the layerGroupSelector) as parameter.
    //
    // If this is NOT the case, it means that there ar NO other layerGroups selected
    // so the activeItem needs to be removed. This is done by calling the function:
    // "removeItem" and passing the activeItem as parameter.
		item.layerGroups.size > 0 ? this.setLayerGroup(item.layerGroups.keys().next().value) :
			this.removeItem(item)
	};

	/*
	Here we create a function called: "getItemDataByAmount()"

	This function is triggered when a amount is selected from the dropdown list
	related to the amount selection (which is defined in the HTML page).

	This function contains a switch/case. The switch case takes the itemType,
	which in our case can be a tracker as input. Depending on the
	itemType, the corresponding function is triggered.

	These functions trigger a function in the service related to the item which
	is passed in the function: "getItemDataByAmount()".

	The data obtained from the function which was triggered in the service, will
	then be passed as parameter in the function: "loadItemData()". The function
	loadItemData() will then assign the returned data to the item which is passed
	as parameter in this function.
	*/
	getItemDataByAmount(item: Item, amount): void {
		switch (item.type) {
			case 'tracker':
				this._CraneService.getTransmissionsAmount(item.id, amount).subscribe(
					(transmissions) => {
						this.loadItemData(transmissions)
					}
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
	which in our case can be a tracker, as input. Depending on the
	itemType, the corresponding function is triggerd.

	These functions trigger a function in the service related to the item which
	is passed in the function: "getItemDataByCountry()".

	The data obtained from the function which was triggered in the service, will
	then be passed as parameter in the function: "loadItemData()". The function
	loadItemData() will then assign the returned data to the item which is passed
	as parameter in this function.
	*/
	getItemDataByCountry(item: Item, coords: Number[][]): void {
		switch (item.type) {
			case 'tracker':
				this._CraneService.getTransmissionsCountry(item.id, coords).subscribe(
					(transmissions) => {
						this.loadItemData(transmissions)
					}
				)
				break;
			default:
				break;
		};
	};

};
