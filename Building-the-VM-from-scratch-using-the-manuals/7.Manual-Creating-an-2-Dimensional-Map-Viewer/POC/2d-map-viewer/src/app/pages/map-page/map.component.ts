/*
Here we import the default angular modules
*/
import {
	Component,
	OnInit
} from '@angular/core';

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
import {
	MapService
} from 'src/app/services/map.service'
import {
	CraneService
} from 'src/app/services/crane.service'
import {
	PortService
} from 'src/app/services/port.service'

/*
Here we create a global constant called:"ol".
This constant represents the instance of the geospatial framework OpenLayers.
To use the build in functions of OpenLayers we first need to call this constant
*/
declare const ol: any;

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
	providers: [MapService, CraneService,PortService]
})
export class MapComponent implements OnInit {
	
	/*
	Here we create a global variable called: "map". This is the variable
	to which the OpenLayers map will be assigned after it's created. Because
	of the global variable we can use the map throughout the whole component.
	*/
	public map: any;

	/*
	Here we create a global variable called: "mapProviders". The variable
	is a javascript map which will contain key|values. The javascript map will be
	populated with available map providers once the function:"getMapProviders()"
	is triggered.
	*/
	public mapProviders: Map < any, any > = new Map();

	/*
	Here we create a global variable called: "mapLayer".
	This is the variable to which the base layer of the map wil be assigned.

	We set the default map (The map that will be shown when the component is
	loaded) to the local OpenStreetMap map.

  We assign the URL on which the Local OpenSteetMap tiles
	are available served from the Tilestache Tileserver running behind the
	NGINX webserver.
	*/
	public mapLayer: any = new ol.layer.Tile({
		source: new ol.source.XYZ({
			url: "http://localhost/tiles/openstreetmap-local/{z}/{x}/{y}.png"
		}),
		zIndex: 1
	});

	/*
	Here we create a global variable called: "seaLayer" to which we assign
	a Tile layer to which we assign the URL on which the Local OpenSeaMap tiles
	are available served from the Tilestache Tileserver running behind the
	NGINX webserver.
	*/
	public seaLayer: any = new ol.layer.Tile({
		source: new ol.source.XYZ({
			url: "http://localhost/tiles/openseamap-local/{z}/{x}/{y}.png"
		}),
		zIndex: 2
	});

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
	Here we create a global variable called: "layerStyles".
	The value of this variable is a dictionary that contains the default
	styling of the layers.

	To create a line we use the OpenLayers style: "Stroke". We give the stroke
	a width and a color.

	To create a marker we use the OpenLayers style: "Icon". We pass the
	location of our pins as source of the icon. We also anchor the icon
	to be displayed above the data point.
	*/
	public layerStyles: any = {
		'lineString': new ol.style.Style({
			stroke: new ol.style.Stroke({
				width: 2,
				color: "#FF0000",
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
	Here we create a global variable called: "colorList".

	The value of the colorList is a JavaScriptMap which contains key/values.
	The keys are the names of the available colors and the values are the
	hex color code of the related color.

	The user of the application only sees the key in the dropdown list for changing
	the color style. When a color is selected the value of the key will be used.
	*/
	public colorList: Map < string, string > = new Map([
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
	public widthList: Map < string, number > = new Map([
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
	public lineTypeList: Map < string, number[] > = new Map([
		["Dotted", [.1, 5]],
		["Striped", [10, 25]],
		["Fluent", [0, 0]]
	]);

	/*
	Here we create a global variable called: "styleDict".
	The value of this variable is a dictionary that is empty first.
	When layer styles are changed, the changes are added to the related entry
	in the styleDict.
	*/
	public styleDict: any = {
		'color': '',
		'width': '',
		'type': '',
		'src': ''
	};

	/*
	Here we create a global variable called: "elevationProfile".
	After creating an instance of the elevation profile, this instance will
	be assigned to this variable.
	*/
	public elevationProfile: any;

	/*
	Here we create a global variable called: "elevationProfileOpen". The value
	of this variable will either be TRUE or FALSE depending on whether the
	elevation profile is opened or not.
	*/
	public elevationProfileOpen: boolean;

	/*
	Here we create a global variable called: "portLayer" to which
	we are going to assign the portLayer after it has been created.
	*/
	public portLayer: any;

	/*
	Here we create the class constructor of the MapComponent. We pass the map and
	CraneServices in the constructor. We assign the services to a fitting variable,
	this variable can be reused throughout the whole component. We use these
	variables to call the functions in our services which will then perform API
	calls to our Flask-API.
	*/
	constructor(private _MapService: MapService,
		private _CraneService: CraneService,
	  private _PortService: PortService) {}

	/*
	Here we create the ngOnInit() function. All the logic in this function will
	be executed when the component is loaded.
	*/
	ngOnInit() {
		this.createOpenLayersMap();
		this.getItems();
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
	Here we create the function which creates a new instance of an OpenLayers map.
	in the function we create a View and assign the base layer to the map. The map
	will be created in the HTML div element with the id: "map". This is the div
	element in the layout of the MapComponent (map.component.html)
	*/
	createOpenLayersMap(): void {

		/*Here we trigger the function:"getMapProviders()" which retrieves the
		entries in our Tilestache server and populates the JavaScriptMap:
		"mapProviders" with the retrieved entries.*/
		this.getMapProviders()

		// Here we create the settings that the map is going to have.
		let mapViewSettings = new ol.View({
			maxZoom: 17,
			center: [0, 0],
			zoom: 3
		});

		/*Here we create a new instance of an OpenLayers map.
		We add the settings as value of the view and the base layer which was
		assigned to the global variable:"mapLayer" as first layer.

		We also call the function:"addOverlays()" to initialize the overlays
		defined in the map.component.html file.*/
		this.map = new ol.Map({
			target: 'map',
			view: mapViewSettings,
			layers: [this.mapLayer],
			overlays: this.addOverlays()
		});
	};

	/*
	Here we create the function that changes the mapProvider. When the function is
	triggered a providerKey is passed. This providerKey is the key of the entry in
	the javascript map: "mapProviders". This function is assigned to the WMSSelection
	settings menu.We then call: “getSource” on the mapLayer to obtain the
	source of the layer. Then we set the URL, on which the map (with the provider
	key which for example could the landscape-map) is available, using “setURL()”.
	*/
	setMapProvider(providerKey): void {
		this.mapLayer.getSource().setUrl(
			"http://localhost/tiles/" + providerKey + "/{z}/{x}/{y}.png"
		)
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

    // Here we call the function getPorts in our PortService file.
		// We pass the results in the function: createPortLayer() which will
		// then create the portLayer.
		this._PortService.getPorts().subscribe(
			(ports: []) => (this.createPortLayer(ports))
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

		 If this is the case nothing will happen since the Item was already selected.

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
				data => data.id.includes(item.id)).length == 1 ? null :
			(this.getInitalItemData(item), this.selectedItems.push(item))

		// Here we make sure that the dateRange in the NgbCalendar is updated
		// with the dateRange of the selectedItem.
		this.dateRange = this.activeItem.dateRangeTotal;

		// Here we create the new static overlays (start and end marker overlays)
		this.setStaticOverlays(item)
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

		 6.1) Obtain the value of the coordinates and transform them to a format
					which can be used with OpenLayers. For this we use the the syntax:
					"ol.proj.fromLonLat()", in which we pass the value of the
					coordinate column as parameter. After the coordinate has been
					transformed it is added to the coordinateList belonging to the item.

		 6.2) Obtain the value of the altitude column and append it to the
					altitudeList belonging to the item.

		 6.3) Obtain the value of the timestamp column and append it to the
					datetimeList belonging to the item.

	7) Assign the first value of the coordinateList (the value at index 0) to
		 the variable: "startCoordinate".

	8) Assign the last value of the coordinateList (the value at index length
		 of the datalist passed as parameter - 1) to the variable endCoordinate.

	9) Create a list containing the first item in the datetimeList and the last
		 item of the datetimeList, created in step 5.3, and assign it to the
		 variable: "dateRangeSelected".

	10) Trigger the function: "addLayerGroup()", and pass the activeItem as
		 parameter. The function: "addLayerGroup()" wil then create the first
		 layerGroup.

	11) Trigger the function: "setStaticOverlays()", this function will add
			the data of the selectedItem to the overlays and set the overlays to
			the correct position.

	12) Trigger the function: "createElevationProfile()", this function will
			add populate the elevation profile chart with the data of the new item.
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
		// start and end date of the selected route.
		item.dateRangeSelected = (
			this.timeConverter(data[0][item.timestampColumn]['$date']) + '/' +
			this.timeConverter(data[data.length - 1][item.timestampColumn]['$date'])
		);

		// Here we create a new layerGroup and add the item as parameter.
		this.addLayerGroup(item);

		// Here we create the new static overlays (start and end marker overlays)
		this.setStaticOverlays(item)

		// Here we create an elevationProfile for the item.
		this.createElevationProfile();
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

	The value: "1500" defines the amount of time it takes for the animation
	to complete. You can increase or decrease it if you want.
	*/
	zoomToLocation(): void {
		/*
		The code below is used for the animation that moves to the start
		coordinates of the activeItem.
		The view of the OpenLayers Map instance is obtained using the syntax:
		".getView()" on the map instance. Then we animate the view by calling the
		function:".animate()"
		*/
		this.map.getView().animate({
			center: this.activeItem.startCoordinate,
			duration: 1500
		});

		/*
		The code below is used for the animation zooms in and out while moving to
		the start coordinates of the activeItem.
		*/
		this.map.getView().animate({
			zoom: this.map.getView().getZoom() - 4,
			duration: 1500 / 2
		}, {
			zoom: 12,
			duration: 1500 / 2
		});
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
	addLayerGroup(item: Item): void {

		// Here we assign the value of this to a variable called: '_this'.
		// We need to do this since the function: "addLayerGroup" contains
		// nested functions.
		let _this = this;

		// Here we assign the value of the dateRangeSelected as layerGroup
		// selector.
		let layerGroupSelector = item.dateRangeSelected;

		// Here we check whether the layerGroup has already been selected.
		if (!item.layerGroups.has(layerGroupSelector)) {

			// Here we create a new lineString and pass the coordinateList as
			// parameter.
			let lineGeometry = new ol.geom.LineString(item.coordinateList);

			// Here we create a new Vector, VectorSource and feature.
			// we add the lineGeometry as geometry of the feature.
			let lineLayer = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: [new ol.Feature({
						type: 'lineString',
						geometry: lineGeometry
					})]
				}),
				// Here we use a style function to set the styling of the
				// lineLayer.
				style: function (feature) {
					return _this.layerStyles[feature.get('type')];
				},
				zIndex: 100
			});

			// Here we create an empty list of points.
			let points = [];

			// Here we create an empty list of pointRotations.
			let pointRotations = [];

			item.routeDistanceList = [0];

			// Here we create a FORloop that loops an amount of times that is
			// equal to the length of the coordinateList.
			for (let i = 0; i < item.coordinateList.length - 1; i++) {

				// Here we create 2 points.
				// The first point gets the value of the coordinates on the index in
				// the coordinateList on which the loop currently is.
				let point1 = item.coordinateList[i];
				// The second point gets the value of the coordinates on the index + 1
				// in the coordinateList on which the loop currently is.
				let point2 = item.coordinateList[i + 1];

				// Here we add the calculated rotations to the pointRotations list.
				pointRotations.push(
					Math.atan2(point2[1] - point1[1], point2[0] - point1[0])
				);


				// Here we add the distance between point1 and point2 to the
				// routeDistanceList. We add the calculated distance to the
				// value of the previous entry of the routeDistance list.
				item.routeDistanceList.push(
					item.routeDistanceList[i] += ol.sphere.getLength(
						new ol.geom.LineString([point1, point2])
					)
				);


				// Here we create the pointStyle.
				let pointStyle = new ol.style.Style({
					image: new ol.style.Icon({
						src: '../../assets/img/arrow.svg',
						anchor: [0.75, 0.5],
						scale: 0.5,
						rotateWithView: true,
						rotation: -pointRotations[i],
						color: '#4271AE',
					}),
				});

				// Here we create a new feature from which we set the geometry to
				// the geometry of point1.
				let point = new ol.Feature({
					geometry: new ol.geom.Point(point1),
				});

				// Here we add the styling to the point using the syntax: ".setStyle()"
				point.setStyle(pointStyle);

				// Here we add the point to our list of points using the syntax:".push()".
				points.push(point);
			};

			// Here we create the point layer and add the list of points as
			// geometry of this feature. We also set the visibility to false
			// since we only want to show the pointLayer when the user toggles it.
			// We also set the zIndex of this layer to 99 since we want it to
			// be displayed below the other layers.
			let pointLayer = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: points
				}),
				visible: false,
				zIndex: 99,
			});

			// Here we create the markerLayer to which we add 2 features which
			// are the markers.
			let markerLayer = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: [
						// We set the geometry of the startMarker to the startCoordinate of
						// the item which we are going to add.
						new ol.Feature({
							type: 'startMarker',
							geometry: new ol.geom.Point(item.startCoordinate)
						}),
						// We set the geometry of the endMarker to the endCoordinate of
						// the item which we are going to add.
						new ol.Feature({
							type: 'endMarker',
							geometry: new ol.geom.Point(item.endCoordinate)
						})
					]
				}),
				// Here we use a style function to set the styling of the
				// markers.
				style: function (feature) {
					return _this.layerStyles[feature.get('type')];
				},
				// We also set the zIndex of this layer to 101 since we want it to
				// be displayed on top of the other layers.
				zIndex: 101,
			});

			// Here we add a new entry to our layerGroups JavaScriptMap.
			item.layerGroups.set(layerGroupSelector, {
				'lineLayer': {
					'layer': lineLayer,
					'coordinates': item.coordinateList,
					'altitudes': item.altitudeList,
					'dates': item.datetimeList,
					'distance': (Math.round(ol.sphere.getLength(lineGeometry) / 1000 * 100) / 100)
				},
				'pointLayer': {
					'layer': pointLayer,
					'pointRotations': pointRotations,
					'routeDistance': item.routeDistanceList
				},
				'markerLayer': {
					'layer': markerLayer,
				}
			});

			// Here we set the layerGroup to be the activeLayerGroup.
			this.setLayerGroup(layerGroupSelector);

			// Here we add the layers to the OpenLayers map.
			this.map.addLayer(lineLayer);
			this.map.addLayer(pointLayer);
			this.map.addLayer(markerLayer);

		} else {
			return;
		};
	};

	/*
		Here we create a function called: "setLayerGroup()".

		This function is triggered in the following functions:

		1) removeLayerGroup(), when removing the currect active layer group we need to
		   set the next selected layer group to be the active layer group.

		2) addLayerGroup(), when a layer group is added we need to set the added
		   layer group to be the activeLayerGroup

		This function is used to set the active layer group and assign the values
		of the active layer group to the correct parameters of the activeItem.
		These values are as follows:

		1) The selected dateRange of the active layer group, which is used to set
		   the start and end date of the DTG selection dropdown boxes.

		2) The totalRouteDistance of the active layer group, which is used to calculate
		   the routeDistance traveled by an item.

		3) The coordinateList of the active layer group, which is used to visualize
		   the data points and lines on the map. The coordinateList is also used
		   when animating the route.

		4) The altitudeList of the active layer group, which is used in the
		   elevationProfile.

		5) The datetimeList of the active layer group, which is used to display the
		   start and end date of the route. This list is also used in the information
		   box when animating the route.

		6) The startCoordinate of the active layer group, which is used to set the
		   start marker.

		7) The endCoordinate of the active layer group, which is used to set the
		   end marker.

		This function also toggles all the overlays of the previous active layerGroup
		off and then creates new overlays related to the new active layerGroup.
	*/
	setLayerGroup(groupKey: string): void {

			// Here we assign the current active item to a variable called: "item".
			let item = this.activeItem;

			// Here we clear the animation of the current active layer group. This will
			// only happen if an animation is running. This is done because otherwise
			// the animation of the previous active layer group will keep running when
			// selecting a new layer group.
			this.clearAnimation();

			// Here we assign the layer group selector (which is the dateRange of the
			// selected layerGroup) to the variable:"dateRangeSelected".
			item.dateRangeSelected = groupKey;

			// Here we set the layerGroup which is selected to be the activeLayerGroup
			// using the layerGroupSelector (groupKey).
			item.activeLayerGroup = item.layerGroups.get(groupKey);

			// Here we assign the value of the distance of the lineLayer to the variable
			// totalRouteDistance. This value was added to the lineLayer dict when the
			// layerGroup was created in the function: "addLayerGroup".
			item.totalRouteDistance = item.activeLayerGroup.lineLayer.distance;

			// Here we assign the list of coordinates of the lineLayer to the variable
			// coordinateList. This value was also added to the lineLayer dict when the
			// layerGroup was created in the function: "addLayerGroup".
			item.coordinateList = item.activeLayerGroup.lineLayer.coordinates;

			// Here we assign the list of altitudes of the lineLayer to the variable
			// altitudeList. This value was also added to the lineLayer dict when the
			// layerGroup was created in the function: "addLayerGroup".
			item.altitudeList = item.activeLayerGroup.lineLayer.altitudes;

			// Here we assign the list of DTG's of the lineLayer to the variable
			// datetimeList. This value was also added to the lineLayer dict when the
			// layerGroup was created in the function: "addLayerGroup".
			item.datetimeList = item.activeLayerGroup.lineLayer.dates;

			// Here we assign the first coordinate of the coordinateList (on index 0)
			// of the lineLayer to the variable startCoordinate.
			item.startCoordinate = item.activeLayerGroup.lineLayer.coordinates[0];

			// Here we assign the first coordinate of the coordinateList (on index
			// (length of coordinateList - 1)) of the lineLayer to the variable
			// endCoordinate.
			item.endCoordinate = item.activeLayerGroup.lineLayer.coordinates[
				item.coordinateList.length - 1
			]

			// Here we call the function toggleOverlay and pass "all" as parameter.
			// This makes sure the old overlays are removed from the map.
			this.toggleOverlay("all");

			// Here we create the new static overlays (start and end marker overlays)
			// using the information (assigned in the lines above) of the current item.
			this.setStaticOverlays(item)
		};

	/*
		Here we create a function called: "addOverlays()".

	  This function is only called in the function:"createOpenLayersMap".

	  The purpose of this function is to instantiate the overlays on the
	  map. These overlays are as follows:

	  1) The GeoMaker, which is the marker that moves from coordinate to coordinate
	     when the animation is playing.

	  2) Info box of the GeoMaker, which is the information box that moves with the
	     GeoMaker when the animation is running (The currentCoordinateIndex).
	     This information box contains the following DYNAMIC info:
	     - The name of the route that is visualized
	     - The coordinates on which the GeoMaker is. This value is constantly updated
	       using the coordinateList belonging to the item that is currently visualized
	     - The DTG on which the GeoMaker is. This value is also constantly updated
	       using the datetimeList belonging to the item that is currently visualized.

	  3) The Start Marker info box, which is the information box assigned to the
	     start marker (first coordinate of the coordinateList) of the visualized
	     route. This information box contains the following STATIC info:
	     - The name of the route that is visualized
	     - The first set of coordinates in the coordinateList belonging to the
	       item that is currently visualized.
	     - The first DTG in the datetimeList belonging to the item that is currently
	       visualized.

	  4) The End Marker info box, which is the information box assigned to the
	     end marker (the last coordinate of the coordinateList) of the visualized
	     route. This information box contains the following STATIC info:
	     - The name of the route that is visualized.
	     - The last set of coordinates in the coordinateList belonging to the
	       item that is currently visualized.
	     - The last DTG in the datetimeList belonging to the item that is currently
	       visualized.

	  The way to create an overlay is as follows:
	  The syntax used for creating an overlay is ol.Overlay. Then we pass the
	  following values:
	  - An id which represents the overlay.
	  - The positioning in which the overlay should be displayed.
	  - The position of the overlay. When instantiating the overlay, we set the
	    position to undefined since we don't have any position yet.
	  - The HTML element which represents the overlay. These elements are defined
	    at the top of the map.component.html file. For this we use the syntax:
	    "document.getElementById('{the id of the element in the HTML file}')"
	*/
	addOverlays(): any[] {

	    // Here we create the GeoMaker overlay and assign it to a variable called:
	    // "marker".
	    let marker = new ol.Overlay({
	      id: 'geomarker',
	      positioning: 'center-center',
	      position: undefined,
	      element: document.getElementById('geomarker'),
	    });

	    // Here we create the GeoMaker Info overlay and assign it to a variable
	    // called:"markerInfo".
			let markerInfo = new ol.Overlay({
				id: 'geomarkerInfo',
				positioning: 'center-center',
				position: undefined,
				element: document.getElementById('geomarkerInfo'),
			});

	    // Here we create the startMarker Info overlay and assign it to a variable
	    // called:"startMarkerInfo".
			let startMarkerInfo = new ol.Overlay({
				id: 'startmarkerInfo',
				positioning: 'center-center',
				position: undefined,
				element: document.getElementById('startmarkerInfo'),
			});

	    // Here we create the endMarker Info overlay and assign it to a variable
	    // called:"endMarkerInfo".
			let endMarkerInfo = new ol.Overlay({
				id: 'endmarkerInfo',
				positioning: 'center-center',
				position: undefined,
				element: document.getElementById('endmarkerInfo'),
			});

	    //Here we return a list containing the marker instances.
			return [marker, markerInfo, startMarkerInfo, endMarkerInfo]
		};

	/*
	Here we create a function called: "setDynamicOverlays()".

	This function is used to used to set the values of the GeoMarker information
	box and update the position of the GeoMaker itself. The function takes an
	Item as input parameter on the function call. The item passed in the function
	is also the activeItem.

	The function is triggered in the following functions:

	1) setStaticOverlays(),because everytime the static overlays are set
	   the dynamic overlays also needs to be set. This is not the other way around.
	2) animateRoute(), because the information displayed in the GeoMaker info
		 box needs to be updated constantly when an animation is playing.
	3) clearAnimation(), because when an animation is cleared the GeoMaker info
	   box needs to be reset to the original state.

	The function uses the value of the item's currentCoordinateIndex to determine
 	what values have to be extracted from the datalist in question (e.g.
 	the coordinateList). The value of the currentCoordinateIndex is constantly
 	incremented in the animateRoute() function.

	The following steps are executed in this function:
	1) The div element representing the geomarker is obtained from the HTML page.

	2) The div element representing the GeoMaker info box is obtained from the
	   HTML page.

	3) The current coordinates from the coordinateList of the activeItem
	   (the coordinate on the index of the value of the currentCoordinateIndex)
		 is obtained and transformed in a coordinate format which is human readable.

	4) The longitude coordinate is extracted and transformed to only contain 4
	   numbers behind the decimal (e.g 1.xxxx).

	5) the latitude coordinate is extracted and transformed to only contain 4
	   numbers behind the decimal (e.g 1.xxxx).

	6) The current datetime is extracted form the datetimeList (the datetime on
	   the index of the value of the currentCoordinateIndex).

	7) The current distance traveled is extracted from the routeDistanceList (the
     distance on the index of the value of the currentCoordinateIndex).

	8) A check is performed to check if the distance is not equal to undefined.
	   This is done since the first distance value is undefined.

		 In case the distance is EQUAL to undefined, the distance is set to 0
		 In case the distance is NOT EQUAL to undefined current distance traveled is
		 extracted and transformed to not contain any numbers behind the decimal.

  9) The position of the GeoMaker is updated using the current coordinates.

	10) The position of the GeoMaker information box is updated using the current
	    coordinates.

	11) The content of the HTML div element, representing the GeoMaker Info box,
	    is added using the data extracted in the previous steps.

	*/
	setDynamicOverlays(item: Item): void {

		// Here we obtain the HTML element representing the geomarker.
		let geomarker = this.map.getOverlayById('geomarker')

		// Here we obtain the HTML element representing the GeoMaker info box.
    let geoMarkerInfo = this.map.getOverlayById('geomarkerInfo')

		// Here we transform the current coordinates to a human readable format.
		let transformedCoord = ol.proj.transform(
      item.coordinateList[item.currentCoordinateIndex],
      'EPSG:3857', 'EPSG:4326')

		// Here we extract and transform the longitude coordinates to only contain
		// 4 numbers behind the decimal. We do this by using the syntax: ".toFixed".
    let longitudeCoord = transformedCoord[0].toFixed(4)

		// Here we extract and transform the latitude coordinates to only contain
		// 4 numbers behind the decimal. We do this by using the syntax: ".toFixed".
    let latitudeCoord = transformedCoord[1].toFixed(4)

		// Here we extract the current DateTimeGroup.
    let datetime = item.datetimeList[item.currentCoordinateIndex]

		// Here we extract the current distance traveled.
		let distance = item.routeDistanceList[item.currentCoordinateIndex - 1]

		// Here we perform a check to determine whether the value of the distance
		// is not equal to undefined.
		distance != undefined ? distance = item.routeDistanceList[item.currentCoordinateIndex].toFixed(0)
                          : distance = 0

		// Here we set the position of the geomarker by passing the current coordinates.
    geomarker.setPosition(item.coordinateList[item.currentCoordinateIndex]);

		// Here we set the position of the GeoMaker Info box, using the current coordinates.
		geoMarkerInfo.setPosition(item.coordinateList[item.currentCoordinateIndex]);

		// Here we set the content of the GeoMaker Info box HTML element.
		// We use the syntax: "\u000A" to add a next line to the text.
		geoMarkerInfo.getElement().setAttribute('data-hint',
			'Geomarker of ' + item.type + ': ' + item.name +
			'\u000A' +'Distance traveled: ' + distance + 'M' +
			'\u000A\u000ACoordinates:\u000ALongitude: ' + longitudeCoord +
			'\u000ALatitude: ' + latitudeCoord +
			'\u000A\u000ACurrent DTG:' + datetime);
	};

	/*
	Here we create a function called: "setStaticOverlays()".

	This function is used to used to set the values of the Start and endMarker
	information boxes. The function takes an Item as input parameter on the
	function call. The item passed in the function is also the activeItem.

	The function is triggered in the following functions:

	1) setLayerGroup(),because when a new layerGroup is added it automatically
	   becomes the activeLayerGroup. So we need to update the overlay content and
		 positions according to the new activeLayerGroup.

	2) loadItemData(), because when an item is loaded for the first time the item
	   automatically becomes the activeItem so we need to update the overlay
		 content and positions according to the new activeItem.

	3) selectItem(), because when an item is select it becomes the activeItem
	   so we need to update the overlay content and positions according to the new
		 activeItem.

	3) removeItem(), because when an item is removed the next item in the
	   selectedItem list will become the activeItem so we need to update the
		 overlay content and positions according to the new activeItem.

	The following steps are executed in this function:

	1) The function setDynamicOverlays() is triggerd since the dynamic overlays
	   always need to be updated when the static overlays are updated.

	2) The div element representing the startMarker info box is obtained from
	   the HTML page.

	3) The startCoordinates of the activeItem is obtained and transformed in a
	   coordinate format which is human readable.

	4) The content of the HTML div element, representing the startMarker info box,
		 is added using the data extracted in the previous steps.

  5) The div element representing the endMarker info box is obtained from
	 	 the HTML page.

	6) The endCoordinates of the activeItem is obtained and transformed in a
	   coordinate format which is human readable.

	7) The content of the HTML div element, representing the endMarker info box,
	 	 is added using the data extracted in the previous steps.

	8) The elevationData is loaded by triggering the function: "loadElevationData()"
	*/
	setStaticOverlays(item: Item): void {

		// Here we trigger the function setDynamicOverlays() in which we pass
		// the item which was passed as input parameter on the function call.
		this.setDynamicOverlays(item);

		// Here we obtain the HTML div element representing the startMarker info box
		// from the HTML page.
		let startMarkerInfo = this.map.getOverlayById('startmarkerInfo');

		// Here we transform the startCoordinate into a human readable format.
		let startCoordTransformed = ol.proj.transform(
			item.startCoordinate, 'EPSG:3857', 'EPSG:4326');

		// Here we set the content of the startMarker Info box HTML element.
		// We use the syntax: "\u000A" to add a next line to the text.
		startMarkerInfo.getElement().setAttribute('data-hint',
			'Start marker of: ' + item.type + ': ' + item.name + '\u000A' +
			'Distance traveled: ' + 0 + 'KM' +
			'\u000A\u000ACoordinates:\u000ALongitude: ' +
			startCoordTransformed[0].toFixed(4) + '\u000ALatitude: ' +
			startCoordTransformed[1].toFixed(4) +
			'\u000A\u000ACurrent DTG:' + item.datetimeList[0]);

		// Here we obtain the HTML div element representing the endMarker info box
		// from the HTML page.
		let endMarkerInfo = this.map.getOverlayById('endmarkerInfo')

		// Here we transform the endCoordinate into a human readable format.
		let endCoordTransformed = ol.proj.transform(
			item.endCoordinate, 'EPSG:3857', 'EPSG:4326')

		// Here we set the content of the endMarker Info box HTML element.
		// We use the syntax: "\u000A" to add a next line to the text.
		endMarkerInfo.getElement().setAttribute('data-hint',
			'End marker of: ' + item.type + ': ' + item.name + '\u000A' +
			'Distance traveled: ' + item.totalRouteDistance + 'KM' +
			'\u000A\u000ACoordinates:\u000ALongitude: ' +
			endCoordTransformed[0].toFixed(4) + '\u000ALatitude: ' +
			endCoordTransformed[1].toFixed(4) +
			'\u000A\u000ACurrent DTG:' + item.datetimeList[item.datetimeList.length - 1]);

		// Here we trigger the function which loads the elevationData.
		this.loadElevationData();
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
		this.activeItem.id == item.id ? (this.clearAnimation(),
				this.selectItem(this.selectedItems.values().next().value)) :
			null;

		// Here we loop trough all the layers per layer group and remove them from
		// the map.
		item.layerGroups.forEach(layerGroup => {
			for (let [key, value] of Object.entries(layerGroup)) {
				this.map.removeLayer(value['layer'])
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

		/*
		 If the length of the selectedItems list is 0, after removing the item:
		 Toggle the overlays of. Else the overlays are set to the new item.
		*/
		this.selectedItems.length == 0 ? this.toggleOverlay('all') :
			this.setStaticOverlays(this.activeItem)
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

    // Here we clear the animation if any is running.
		this.clearAnimation()

    // Here we obtain the layerGroup which has to be removed from the
    // layerGroups JavaScriptMap using the layerGroupKey passed as parameter
    // on the function call. We assign the layerGroup to a variable called:
    // "groupToRemove".
		let groupToRemove = item.layerGroups.get(layerGroupKey)

    // Here we loop through all the entries in the layerGroup. We do this to
    // remove all the layers, belonging to the layerGroup to remove, from the
    // OpenLayers Map. We do this by calling the functio:".removeLayer" on the
    // OpenLayers Map instance and passing the value of the layers (pointLayer,
    // lineLayer and markerLayer).
		for (let [key, value] of Object.entries(groupToRemove)) {
			this.map.removeLayer(value['layer'])
		}

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

	/*
	Here we create a function called: "toggleLayer()".

	This function is used to toggle layers such as the MarkerLayer, PointLayer,
	LineLayer etc. and is assigned to multiple buttons (related to layer toggling)
	which are defined in the HTML page of the MapComponent.

	The function takes a layerType as input parameter. The layerType could for
	example be “LineLayer”.

	The following steps are executed when the function is triggered:

	1) The layer which needs to be toggled is obtained from the items
	   activeLayerGroup. Since a layerGroups contains 3 layers (Point, Marker and
	   Line layers) we can obtain the desired layer by passing the layerType.

	2) A check is performed to determine whether the layer is visible or not.
	   If the layer is visible it will be come unvisible.
		 If the layer is unvisible it will become visible.

		 We do this by using the build in OpenLayers method: ".setVisible()" and
		 passing True or False as input parameter.
	*/
	toggleLayer(layerType: string): void {

		// Here we obtain the layer which needs to be toggled from the
		// activeLayerGroup by passing the layerType.
		let layerToToggle = this.activeItem.activeLayerGroup[layerType].layer

		// Here we perform a check to determine whether the layer visibility is
		// set to True or False.
		layerToToggle.getVisible() == true ? layerToToggle.setVisible(false) :
			layerToToggle.setVisible(true)
	};

	/*
	Here we create a function called: "toggleOverlay()".

	This function is used to toggle overlays such as the GeoMaker, GeoMarker info
	box and the Start and endMarker information boxes.

	The function assigned to multiple buttons (related to overlay toggling)
	which are defined in the HTML page of the MapComponent.

	The function takes a overlayType as input parameter. The overlayType could for
	example be “geoMarkerInfo”.

	The following steps are executed when the function is triggered:

	1) The overlay is obtained from the OpenLayers Map instance using the
	   overlayType which was passed as input parameter. We do this by using the
		 build in OpenLayers method: ".getOverlayById".

	2) The activeItem is assigned to a variable called: "item".

	3) A switch/case statement determines which code has to be executed depending
	   on the overlayType which was passed as Input parameter.

		 The following can happen in the switch/case:

		 If the overlayType is equal to "geomarkerInfo":

		 A check is performed to see if the position of the geomarkerInfo info box
		 is equal to undefined. If this is the case the position of the geomarkerInfo
		 overlay will be set to the coordinate on which the geomarker itself currently
		 is. If the position of the overlay is not equal to undefined it means the
		 overlay is going to be toggled. This is done by setting the position to
		 undefined.

		 If the overlayType is equal to "startmarkerInfo":

		 A check is performed to see if the position of the startMarker info box
		 is equal to undefined. If this is the case the position of the startMarkerInfo
		 overlay will be set to the start coordinate of the visualized route.
		 If the position of the overlay is not equal to undefined it means the
		 overlay is going to be toggled. This is done by setting the position to
		 undefined.

		 If the overlayType is equal to "endmarkerInfo":
		 A check is performed to see if the position of the startMarker info box
		 is equal to undefined. If this is the case the position of the endMarkerInfo
		 overlay will be set to the end coordinate of the visualized route.
		 If the position of the overlay is not equal to undefined it means the
		 overlay is going to be toggled. This is done by setting the position to
		 undefined.

		 If the overlayType is equal to "all":
		 The positions of all the overlays will be set to undefined. This happens
		 when the last selectedItem is removed by the user.
	*/
	toggleOverlay(overlayType: string): void {

		// Here we obtain the overlay which needs to be toggled using the
		// overlayType.
		let overlay = this.map.getOverlayById(overlayType);

		// Here we assign the activeItem to a variable called item.
		let item = this.activeItem;

		// Here we create the switch/case to determine which code should be executed.
		switch (overlayType) {

			// Incase it's geomarkerInfo the following happens:
			case 'geomarkerInfo':
				// Here we perform the check to see if the geoMarkerInfo position is set
				// to undefined. If this is the case the position of the overlay is set
				// to the activeItem's currentCoordinate.
				overlay.getPosition() == undefined ? overlay.setPosition(
					item.coordinateList[item.currentCoordinateIndex]) :
					overlay.setPosition(undefined)
				break;
			// Incase it's startmarkerInfo the following happens:
			case 'startmarkerInfo':
				// Here we perform the check to see if the startMarkerInfo position is set
				// to undefined. If this is the case the position of the overlay is set
				// to the activeItem's startCoordinate.
				overlay.getPosition() == undefined ? overlay.setPosition(item.startCoordinate) :
					overlay.setPosition(undefined)
				break;
			// Incase it's endmarkerInfo the following happens:
			case 'endmarkerInfo':
			  // Here we perform the check to see if the endMarkerInfo position is set
				// to undefined. If this is the case the position of the overlay is set
			  // to the activeItem's endCoordinate.
				overlay.getPosition() == undefined ? overlay.setPosition(item.endCoordinate) :
					overlay.setPosition(undefined)
				break;
			// Incase it's all the following happens:
			case 'all':
			  // Here we set the position of the geomarker to undefined.
				this.map.getOverlayById('geomarker').setPosition(undefined);
				// Here we set the position of the geoMarkerInfo to undefined.
				this.map.getOverlayById('geomarkerInfo').setPosition(undefined);
			  // Here we set the position of the startMarkerInfo to undefined.
				this.map.getOverlayById('startmarkerInfo').setPosition(undefined);
			  // Here we set the position of the endMarkerInfo to undefined.
				this.map.getOverlayById('endmarkerInfo').setPosition(undefined);
				break;
		};
	};

	/*
	Here we create a function called:"setLayerStyle".

	This function is used to change te styling (color, width, type) of the
	MarkerLayers, PointLayers and LineLayers. The function takes in a layerType
	as input parameter.

	The function is assigned to a button which is defined in the HTML page of
	the MapComponent.

	The function contains a switch/case which is used to determine what layerStyle
	should be changed depending on the layerType.

	Then function creates a new OpenLayers Style object using the values which
	are set in the global variable: 'styleDict'. At first this dictionary is
	empty but when the user changes the styling of a layer, the selected values
	will be assigned to the correct entry in the styleDict.

	The following steps are executed in this function:
	1) A switch case is executed which does the following depending on the layerType
		 which was passed as input parameter on the function call.

		 incase the layerType is equal to lineLayer:

		 A new OpenLayers LineStyle (stroke) is created using the values which are
		 set in the styleDict (selected by the user in the application) as
		 values for the:
		 - width by calling this.styleDict['width']
		 - color by calling  this.styleDict['color']
		 - lineType by calling this.styleDict['type']

		 The linelayer object Style of the currently active layerGroup is then changed
		 using the following syntax:

		 activeLayerGroup.lineLayer[layer].getSource() to obtain the layer source.
		 .getFeatures() to obtain the features in the lineLayer source.
		 .setStyle() to change the styling of all the features. The newly created
		 style is passed as parameter in the setStyle() function call.

		 incase the layerType is equal to markerLayer:

		 A new OpenLayers IconStyle (image) is created for both the Start and End
		 Markers. We use the color set in the styleDict (selected by the user in
		 the application) to specify the image src (Source). These images represent
		 the pins which are found in the folder: assets/img/pins.

		 We pass the selected color in the source link. For example:
		 `assets/img/pins/pin_s_${this.styleDict.color}.png`

		 would become:
		 `assets/img/pins/pin_s_Red.png`

		 if the user selected the color red in the application.

		 After the new styles have been created the overlay HTML element of the
		 GeoMaker (the dot that moves along the visualized route when animating)
		 is obtained. The color of the dot is set to color which was selected by
		 the user.

		 Finally the Start and End marker styles are updated using the same method
		 as mentioned above when changing the lineLayer style. We pass the new marker
		 styles as input parameter in the .setStyle() function.


		 incase the layerType is equal to pointLayer:
		 At this point the functionality for changing the SVG icon representing the
		 arrows has not been implemented. You could do this yourself if you would like.

	*/
	setLayerStyle(layerType: string): void {

		// Here we define the switch/case statement which determines what to do next
		// depending on the layerType which was passed on the function call.
		switch (layerType) {

			// The following code is executed when the layerType == lineLayer
			case 'lineLayer':

				// Here we create a new line style (stroke) and assign it to a variable
				// called: "newLineStyle"
				let newLineStyle = new ol.style.Style({
					stroke: new ol.style.Stroke({
						// Here we obtain the value of the widthList entry using the width
						// entry in the styleDict (which was set by the user).
						width: this.widthList.get(this.styleDict['width']),
						// Here we obtain the value of the colorList entry using the color
						// entry in the styleDict (which was set by the user).
						color: this.colorList.get(this.styleDict['color']),
						// Here we obtain the value of the lineTypeList entry using the type
						// entry in the styleDict (which was set by the user).
						lineDash: this.lineTypeList.get(this.styleDict['type'])
					}),
					// We set the zIndex of the layer to 3 to make sure the layer is shown
					// below the marker and point layer.
					zIndex: 3
				})

				// Here we update the activeLayerGroup LineLayer style using the newLineStyle.
				this.activeItem.activeLayerGroup['lineLayer']['layer'].getSource()
				.getFeatures()[0].setStyle(newLineStyle)

				break;

			// The following code is executed when the layerType == markerLayer
			case 'markerLayer':

				// Here we create a new Startmarker style (image) and assign it to a variable
				// called: "newStartMarkerStyle"
				let newStartMarkerStyle = new ol.style.Style({
					image: new ol.style.Icon({
						// Here we set the amount of Pixels on which the icon should be displayed.
						anchor: [0.5, 1],
						// Here we set the source location of the pin using the color value in
						// the styleDict.
						src: `assets/img/pins/pin_s_${this.styleDict.color}.png`
					}),
					// We set the zIndex of the layer to 5 to make sure the layer is shown
					// above the LineLayer.
					zIndex: 5
				})

				// Here we create a new Endmarker style (image) and assign it to a variable
				// called: "newEndMarkerStyle"
				let newEndMarkerStyle = new ol.style.Style({
					image: new ol.style.Icon({
						// Here we set the amount of Pixels on which the icon should be displayed.
						anchor: [0.5, 1],
						// Here we set the source location of the pin using the color value in
						// the styleDict.
						src: `assets/img/pins/pin_e_${this.styleDict.color}.png`
					}),
					// We set the zIndex of the layer to 5 to make sure the layer is shown
					// above the LineLayer.
					zIndex: 5
				})

				// Here we set the div element styling of the GeoMaker to have the color
				// which was set by the user.
				document.getElementById('geomarker').style["background-color"] = this.colorList
				.get(this.styleDict.color)

				// Here we update the endMarker styling using the newEndMarkerStyle.
				this.activeItem.activeLayerGroup['markerLayer']['layer'].getSource()
				.getFeatures()[1].setStyle(newEndMarkerStyle)

				// Here we update the startMarker styling using the newStartMarkerStyle.
				this.activeItem.activeLayerGroup['markerLayer']['layer'].getSource()
				.getFeatures()[0].setStyle(newStartMarkerStyle)

				break;

			// The following code is executed when the layerType == pointLayer.
			case 'pointLayer':
				break;
		}
	};

	/*
	Here we create a function called:"animateRoute()".

	This function is used to animate a route which is visualized on the OpenLayers
	map. This function is bound to a button in the HTML layout page of the
	MapComponent.

	This function contains 2 nested functions which are as follows:
	- startAnimation, which is only triggered if NO animation is running.
	- pauseAnimation, which is only triggered if AN animation is running.

	When the button is clicked and the function is triggered the following
	steps are executed:

	1) The value of the slider (related to the speed of the animation) is obtained
	   from the HTML page.

	2) A check is performed to see if the animation value of the activeItem is
	   not equal to undefined.

		 If this is not the case (so the value of the animation is equal to undefined)
		 It means that no animation is running so that an animation has to be started.
		 this is done by creating a JavaScript interval method and assigning the
		 value of the interval to the activeItem's animation (so it's not undefined)
		 anymore.

		 The javascript interval method is used to trigger a function after a N amount
		 of seconds / miliseconds. The N amount of seconds is the value of the speed
		 slider which is set by the user in the application.

		 The function that is triggered in the JavaScript interval method is the
		 nested function: "startAnimation()". This function does the following when
		 it's triggerd:

		 1) Trigger the function: "setDynamicOverlays()" to make sure the GeoMaker
		 		and the GeoMaker information box are updated.

		 2) Increment the activeItem's currentCoordinateIndex by 3 to make sure
		    that the coordinateList and datetimeList values are also updated.
				As mentioned before; using the JavaScript interval method will make
				sure that the function:"startAnimation()" is triggered multiple times.
				So each time the startAnimation() function is triggered, the
				currentCoordinateIndex will be incremented by +3 to make sure the geomarker
				moves and the geoMarkerInfo overlay also moves.

		 3) A check is performed to see if the activeItem's currentCoordinateIndex
		    is lower than the length of the activeItem's coordinateList.
				If this is the case (so the currentCoordinateIndex is lower) nothing
				will happen and the function: "startAnimation()" will be triggered again
				using the JavaScript interval method.

				If this is not the case (so the currentCoordinateIndex is higher) it
				means that the animation reached the end of the visualized route so the
				animation has to be paused using the nested function: "pauseAnimation()".
				The activeItem's currentCoordinateIndex is also set to 0 to make sure
				the animation can start again if the user clicks on the start button
				again.

		 If the activeItem's animation value is no equal to undefined it means an
		 animation is currently running (because an interval is assigned to the
	   activeItem's animation) so the animation has to be paused. This is
		 done by calling the function: "pauseAnimation()".

		 The function pauseAnimation() does the following when it's triggered:

		 1) Clear the JavaScript interval which was assigned to the activeItem's
		    animation value.

		 2) Set the activeItem's animation value to undefined. This makes sure that
		    the animation can be restarted if the user clicks on the start button
				again.

	*/
	animateRoute(): void {

		// Here we assign the variable this to a variable: "_this".
		// This is required to access global variables in nested functions.
		let _this = this;

		// Here we obtain the value of the speed input slider which is defined in
		// the MapComponent HTML page.
		let speed = ( < HTMLInputElement > document.getElementById('speed')).value;

		// Here we perform a check to see if the activeItem's animation value
		// is not equal to undefined. If the value is not equal to undefined, the
		// function pauseAnimation is triggerd. If the value is equal to undefined
		// the JavaScript interval function is created in which we pass the function
		// startAnimation() and the value of the variable: "speed" as the amount
		// of miliseconds after which the function startAnimation() has to be
		// triggered.
		this.activeItem.animation != undefined ? pauseAnimation() :
			this.activeItem.animation = setInterval(function () {
				startAnimation();
			}, parseInt(speed));

		// Here we create the nested function: "startAnimation".
		function startAnimation() {

			// Here we set the dynamic overlays by passing the activeItem as input
			// parameter.
			_this.setDynamicOverlays(_this.activeItem)

			// Here we Increment the activeItem's currentCoordinateIndex by 3.
			_this.activeItem.currentCoordinateIndex += 3;

			// Here we perform a check to see if the currentCoordinateIndex value does
			// not exeed the length of the activeItem's coordinateList.
			_this.activeItem.currentCoordinateIndex < _this.activeItem.coordinateList.length ? null :
				(pauseAnimation(), _this.activeItem.currentCoordinateIndex = 0)
		};

		// Here we create the nested function: "pauseAnimation".
		function pauseAnimation() {

			// Here we clear the JavaScript interval by passing the activeItem's
			// animation value as input parameter.
			clearInterval(_this.activeItem.animation);

			// Here we set the activeItem's animation value to undefined.
			_this.activeItem.animation = undefined
		};
	};

	/*
	Here we create a function called:"clearAnimation()".

	This function is used to clear an animation that is currently running. The
	function is triggered by clicking on the clear button defined in the HTML
	layout of the MapComponent or in the following functions:

	- setLayerGroup(), this is because when a new layerGroup is set, the running
	  animation needs te be stopped. Otherwise the data (coordinateList etc.)
		from the new layerGroup will be used in the animation that is running.

	- removeItem(), this is because when an item is removed and an animation of
	  that item is running, error's will occur since the data used by the animation
		is removed when removing the item.

	When the function is triggered the following steps are executed:

	1) The activeItem's currentCoordinateIndex is set to 0.

	2) The JavaScript interval is cleared.

	3) The activeItem's animation value is set to undefined.

	4) The dynamic overlays are set to the new activeItem.

	*/
	clearAnimation(): void {

		// Here we set the activeItem's currentCoordinateIndex to 0.
		this.activeItem.currentCoordinateIndex = 0;

		// Here we clear the JavaScript interval by passing the activeItem's
		// animation value as input parameter.
		clearInterval(this.activeItem.animation);

		// Here we set the activeItem's animation value to undefined.
		this.activeItem.animation = undefined;

		// Here we set the dynamic overlays by passing the activeItem as input
		// parameter.
		this.setDynamicOverlays(this.activeItem)
	};

	/*
	Here we create a function called: "createElevationProfile()"

	This function is used to create the default chart data, create the chart
	settings and create a ChartistJS line chart instance using the default chart
	data and the chart settings.

	The function is triggerd in the function: "loadItemData()".

	The following steps are executed when the function is triggered:
	1) Create an instance of the tooltip module.
	2) Create the default chart data.
	3) Create the chart settings.
	4) Create an instance of a ChartistJS Line chart and assign it to the global
	   variable:"elevationProfile".
	*/
	createElevationProfile(): void {

		// Here we instantiate the tooltip module imported at the top of this file.
		let tool = tooltip

		// Here we create the default values of the chart.
		let chartData = {
			// We create an empty list of labels.
			labels: [],
			// We create a list of series with only 1 entry which is the default entry 0
			series: [
				[0]
			]
		};

		// Here we create the chart settings.
		let chartSettings = {
			// The default max value of the chart is set to 10.
			high: 10,
			// The default low value of the chart is set to 0.
			low: 0,
			// We turn the X-axis gridlines off.
			axisX: {
				showGrid: false
			},
			// We turn the Y-axis gridlines off.
			axisY: {
				showGrid: false
			},
			// We set the area below the line to also be colored.
			showArea: true,
			// We turn the gridlines off.
			showGrid: false,
			// We turn the line off.
			showLine: false,
			// We turn the full chart width on.
			fullWidth: true,
			// We set assign the chartist tooltip plugin as plugin of the chart.
			plugins: [
				Chartist.plugins.tooltip()
			]
		};

		// Here we create the chartistJS line chart instance and assign it to the
		// global variable: "elevationProfile". We pass the default data and
		// settings as input parameters.
		this.elevationProfile = new Chartist.Line('.ct-chart', chartData, chartSettings);
	};

	/*
	Here we create a function called: "loadElevationData()"

	This function is used to load the elevation data from a selected item in the
	ChartistJS elevation profile which is created in the function:
	"createElevationProfile()".

	The function is triggerd in the function: "setStaticOverlays()" since every
	time the setStaticOverlays are set, the elevationData also needs to be loaded.

	The following steps are executed when the function is triggered:
	1) The elevationData is obtained from the activeItem's activeLayerGroup
	   lineLayer.
  2) A check is performed to see if the elevation profile is open.

	   If this is the case a JavaScript timeout method is called.

		 The JavaScript timeout method is used to wait an N amount of time before
		 the code inside the timeout method is executed. We do this because
		 we need to wait one second after the elevationProfile is opened to load
		 the data. If we don't do this, some errors will occur.

		 The code inside the JavaScript timeout method will update the elevationProfile
		 by passing the elevation data as series in the ChartistJS chart.

		 The max en min values of the Chart are also updated by calculating the
		 highest and lowest values of in the elevationData.
	*/
	loadElevationData(): void {

		// Here we assign the variable this to a variable: "_this".
		// This is required to access global variables in nested functions.
		let _this = this;

		// Here we obtain the activeLayerGroup's altitudes (elevationData). This
		// data was assigned to the layer in the function:"addLayerGroup()".
		let elevationData = this.activeItem.activeLayerGroup['lineLayer']['altitudes'];

		// Here we perform a check to see if the elevationProfile is opened.
		if (this.elevationProfileOpen) {
			// Here we create the JavaScript timeout method.
			// All the code inside this method is executed after 1 second.
			setTimeout(function () {
			// Here we update the elevationProfile by using the syntax:"profile.update".
 			_this.elevationProfile.update({
				  // We set the metadata of the data points to: "height Above MSL".
					// This is the text that is shown in the tooltip when hovering over
					// the graphLine.
					series: [{
						meta: 'Height above MSL',
						// We set the values of the series to contain the list of elevationData.
						// We use the slice method to make sure only 1000 datapoints are shown
						// in the elevationProfile. This is because the profile will become
						// very laggy if there are more than 100 datapoints selected.
						value: elevationData.slice(0, 1000)
					}]
				}, {
					// Here we set the highest y-axis value to the highest value in the
					// list of elevation data.
					high: Math.max(...elevationData.slice(0, 1000)),
					// Here we set the lowest y-axis value to the lowest value in the
					// list of elevation data.
					low: Math.min(...elevationData.slice(0, 1000))
				}, true)}, 1);
		};
	};

	/*
	Here we create a function called: "createPortLayer()".

	This function is used to create datapoints on the map which each represent
	a port. The function is triggered in the function:"getItems()" and takes a
	list of ports as input parameter.

	The following steps are executed when the function is triggered:

	1) An empty list of points is created.

	2) A new OpenLayers style is created.

	3) A forEach loop is executed on the list of ports that is passed on the
	   function call.

		 The forEach loop does the following for each of the entries (ports)
		 in the list:
		 3.1) create a new OpenLayers feature, obtain and transform the coordinates
		      of the entry and assign it as geometry of the newly created feature.

		 3.2) Assign the point styling to the newly created feature.

		 3.3) Add the newly created feature to the empty pointList which was created
		      in the first step.

	4) A new VectorLayer is created, a new VectorSource is created to which we
	   assign the pointList (containing the features created in the previous step
	   ) as features. We assign the newly created VectorSource as source of the
		 newly created VectorLayer.

	5) The zIndex of the portLayer is set to 100 to make sure the layer is
	   displayed on top of all the other layers.

	*/
	createPortLayer(ports){
		  // Here we create an empty list of points.
			let points = []

			// Here we create the styling of the datapoints
			let pointStyle = new ol.style.Style({
					image: new ol.style.Circle({
						  // We set the inside of the Circle to lightRed
							fill: new ol.style.Fill({
									color: 'rgba(178,34,34, 0.7)'
							}),
						  // We set the border of the Circle to darkRed with a width of 1
							// pixel
							stroke: new ol.style.Stroke({
									width: 1,
									color: 'rgba(178,34,34, 1)'
							}),
							// We set the radius of the circle (size) to 3 pixels.
							radius: 3,
					}),
			});

			// Here we create a forEach loop which loops through all the entries in
			// the list of ports which is passed on the function call.
			ports.forEach(coord => {
				   // Here we create a new Feature. We transform the coordinates
					 // in the portList to a format which OpenLayers understands.
					 // We assign the transformed coordinates as geometry of the newly
					 // created feature.
					 let point = new ol.Feature({
							 geometry: new ol.geom.Point(ol.proj.fromLonLat(coord)),
					 });

					// Set the style of the newly created feature using the pointStyle
					// which we created earlier.
					point.setStyle(pointStyle)

					//Add the newly created feature (point) to the empty pointList.
					points.push(point);
			})

			// Here we create a new VectorLayer and VectorSource to which we assign
			// the pointList (containing all the point features). We assign the
			// newly created VectorLayer to the global variable:"portLayer".
			this.portLayer = new ol.layer.Vector({
					source: new ol.source.Vector({features: points}),
			});

			// Here we set the zIndex of the portLayer to 100.
			this.portLayer.setZIndex(100)
	};
};
