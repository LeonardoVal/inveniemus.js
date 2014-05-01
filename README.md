Inveniemus
==========

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A search and optimization library, focusing on [metaheuristics](http://en.wikipedia.org/wiki/Metaheuristic). Currently includes implementations for: [hill climbing search](http://en.wikipedia.org/wiki/Hill_climbing), [simulated annealing](http://en.wikipedia.org/wiki/Simulated_annealing) and [genetic algorithms](http://en.wikipedia.org/wiki/Genetic_algorithm).

It supports loading with AMD (with [RequireJS](http://requirejs.org/)) or a script tag (sets 'inveniemus' in the global namespace). In order to work requires another library of mine called [basis](https://github.com/LeonardoVal/basis.js). 

## License

Open source under an MIT license. See [LICENSE](LICENSE.md).

## Development

Development requires [NodeJS](http://nodejs.org/) (ver >= 0.10). Download the repository and run `npm install` to install dependencies, like: [RequireJS](http://requirejs.org/), [Grunt](http://gruntjs.com/), [Karma](http://karma-runner.github.io/) and [Jasmine](http://jasmine.github.io/).

There is also a dependency with another library of mine: [creatartis-base](http://github.com/LeonardoVal/creatartis-base). It is included in `package.json` as a development dependency, but it is really a production dependency. It must be installed manually. This avoids problems which arise when `npm install` duplicates this module. Running [`npm dedupe`](https://www.npmjs.org/doc/cli/npm-dedupe.html) should help, yet as of the date this was written [it does not work when using URL dependencies](https://github.com/npm/npm/issues/3081#issuecomment-12486316). 

## Contact

This software is being continually developed. Suggestions and comments are always welcome via [email](mailto:leonardo.val@creatartis.com).

Contributors:

* [Andrés Zeballos Juanicó](mailto:andreszeballosjuanico@gmail.com).
* [Gonzalo Martínez](gonzalo.martinez@live.com).
* [Mathías Lepratte](mlepratte3108@hotmail.com).