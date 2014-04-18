/** Package wrapper and layout.
*/
"use strict";
(function (init) { // Universal Module Definition.
	if (typeof define === 'function' && define.amd) {
		define(['basis'], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) {
		module.exports = init(require('basis')); // CommonJS module.
	} else { // Browser or web worker (probably).
		(0, eval)('this').inveniemus = init(global.basis);
	}
})(function __init__(basis){
// Import synonyms. ////////////////////////////////////////////////////////////
	var declare = basis.declare,
		iterable = basis.iterable;
	
// Library layout. /////////////////////////////////////////////////////////////
	var exports = {
		__init__: __init__
	};
	exports.__init__.dependencies = [basis];