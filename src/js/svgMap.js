// Wrapper function
var svgMap = function(options) {
	this.init(options)
};

// Initialize SVG Worldmap
svgMap.prototype.init = function(options) {
	// Default options, pass a custom options object to overwrite specific
	var defaultOptions = {
		// The id of the element to render the map in
		targetElementID: '',

		// The element to render the map in
		targetElement: null,

		// Minimum and maximum zoom
		minZoom: 1,
		maxZoom: 25,

		// Initial zoom
		initialZoom: 1.06,

		// Zoom sensitivity
		zoomScaleSensitivity: 0.2,

		// Zoom with mousewheel
		mouseWheelZoomEnabled: true,

		// Data colors
		colorMax: '#CC0033',
		colorMin: '#FFE5D9',
		colorNoData: '#E2E2E2',

		// The flag type can be 'image' or 'emoji'
		flagType: 'image',

		// The URL to the flags when using flag type 'image', {0} will get replaced with the lowercase country id
		flagURL: 'https://cdn.jsdelivr.net/gh/hjnilsson/country-flags@latest/svg/{0}.svg',

		// Decide whether to show the flag option or not
		hideFlag: false,

		// The default text to be shown when no data is present
		noDataText: 'No data available',

		// Country specific options
		countries: {
			// Western Sahara: Set to false to combine Morocco (MA) and Western Sahara (EH)
			EH: true
		}
	};

	this.options = Object.assign({}, defaultOptions, (options || {}));
	this.validateOptions(this.options, function() {
		// Global id
		this.id = this.options.targetElementID || btoa(Math.random());

		// Cache wrapper element
		this.wrapper = this.options.targetElementID ? document.getElementById(this.options.targetElementID) : this.options.targetElement;

		// Create the map
		this.createMap();

		// Apply map data
		this.applyData(this.options.data);
	}.bind(this));
};