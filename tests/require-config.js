(function () { "use strict";
	var config = {
		paths: {
			"inveniemus": "../build/inveniemus",
			"creatartis-base": "../node_modules/creatartis-base/build/creatartis-base.min",
			"sermat": "../node_modules/sermat/build/sermat-umd-min",
			"dygraph": "../node_modules/dygraphs/dist/dygraph.min"
		}
	};
	require.config(config);
	console.log("RequireJS configuration: "+ JSON.stringify(config, null, '  '));
})();
