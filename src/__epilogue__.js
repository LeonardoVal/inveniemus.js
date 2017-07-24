// See __prologue__.js
	[Element, Problem, Metaheuristic,
	// metaheuristics.
	// problems.
	].forEach(function (type) {
		type.__SERMAT__.identifier = exports.__package__ +'.'+ type.__SERMAT__.identifier;
		exports.__SERMAT__.include.push(type);
	});
	Sermat.include(exports); // Inveniemus uses Sermat internally.

	return exports;
}
