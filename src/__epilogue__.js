// See __prologue__.js
	base.Iterable.chain(exports, metaheuristics, problems).forEachApply(function (id, def) {
		if (typeof def === 'function' && def.__SERMAT__ && def.__SERMAT__.identifier) {
			def.__SERMAT__.identifier = exports.__package__ +'.'+ def.__SERMAT__.identifier;
			exports.__SERMAT__.include.push(def);
		}
	});
	return exports;
});