// UMD module definition
(function (window, document) {
	// AMD
	if (typeof define === 'function' && define.amd) {
		define('svgMap', function () {
			return svgMap;
		});

		// CMD
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = svgMap;
	} else {
		window.svgMap = svgMap;
	}
})(window, document)