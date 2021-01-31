// Apply the data to the map
svgMap.prototype.applyData = function (data) {
	this.options.data = data;
	var max = null;
	var min = null;

	// Get highest and lowest value
	Object.keys(data.values).forEach(function (countryID) {
		var value = parseInt(data.values[countryID][data.applyData], 10);
		max === null && (max = value);
		min === null && (min = value);
		value > max && (max = value);
		value < min && (min = value);
	});

	data.data[data.applyData].thresholdMax && (max = Math.min(max, data.data[data.applyData].thresholdMax));
	data.data[data.applyData].thresholdMin && (min = Math.max(min, data.data[data.applyData].thresholdMin));

	// Loop through countries and set colors
	Object.keys(this.countries).forEach(function (countryID) {
		var element = document.getElementById(this.id + '-map-country-' + countryID);
		if (!element) return;
		if (!data.values[countryID]) {
			element.setAttribute('fill', this.options.colorNoData);
			return;
		}
		var value = Math.max(min, parseInt(data.values[countryID][data.applyData], 10));
		var ratio = max === min ? 1 : Math.max(0, Math.min(1, (value - min) / (max - min)));
		var color = this.getColor(this.options.colorMax, this.options.colorMin, ratio);
		element.setAttribute('fill', color);
	}.bind(this));
	if (this.options.fitToData) {
		var { offsetWidth: mapWidth, offsetHeight: mapHeight } = this.mapWrapper;
		var scaleFactor = mapWidth / (mapWidth > mapHeight ? 2000 : 1001);
		var mapCenterPoint = [mapWidth / 2, mapHeight / 2];
		var points = Object.keys(data.values).map(countryCode => {
			return this.mapImage.querySelector(`[data-id="${countryCode}"]`);
		}).filter(path => path != null).reduce((accumulator, path) => {
			var pathDefinition = (path.attributes.d.value.match(/[A-Za-z][\d.,-]+/g) || []).map(string => {
				const command = string.charAt(0);
				const coordinates = string.substring(1).split(string.match(',') ? ',' : /(?<=\d)(?=-)/g).map(coordinate => parseFloat(coordinate.trim()));
				command.match(/^[Hh]$/g) && coordinates.push(0);
				command.match(/^[Vv]$/g) && coordinates.unshift(0);
				return { command, coordinates };
			});
			let currentPoint = [...pathDefinition[0].coordinates];
			pathDefinition.forEach(definition => {
				if (definition.command.match(/^[A-Z]$/g)) {
					currentPoint = [...definition.coordinates];
				} else {
					const [x, y] = currentPoint;
					currentPoint = [x + definition.coordinates[0], y + definition.coordinates[1]];
				}
				definition.absoluteCoordinates = currentPoint;
			});
			pathDefinition.forEach(definition => {
				definition.absoluteCoordinates = [definition.absoluteCoordinates[0] * scaleFactor, definition.absoluteCoordinates[1] * scaleFactor];
			});
			return [...accumulator, ...pathDefinition.map(a => a.absoluteCoordinates)];
		}, []);
		this.resetMapZoom();
		if (points.length > 0) {
			var minX = Math.min(...points.map(([x]) => x));
			var minY = Math.min(...points.map(([, y]) => y));
			var maxX = Math.max(...points.map(([x]) => x));
			var maxY = Math.max(...points.map(([, y]) => y));
			var boundingBoxWidth = maxX - minX;
			var boundingBoxHeight = maxY - minY;
			var xZoomFactor = 2000 * scaleFactor / boundingBoxWidth;
			var yZoomFactor = 1001 * scaleFactor / boundingBoxHeight;
			this.mapPanZoom.pan({ x: mapCenterPoint[0] - (minX + boundingBoxWidth / 2), y: mapCenterPoint[1] - (minY + boundingBoxHeight / 2) });
			this.mapPanZoom.zoom(Math.round(Math.min(xZoomFactor, yZoomFactor) * .8));
		}
	}
};