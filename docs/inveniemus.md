Inveniemus
==========

Inveniemus is a search and optimization library for Javascript. It focuses on a class of optimization techniques, called [metaheuristics](http://en.wikipedia.org/wiki/Metaheuristic), which include algorithms like [hill climbing search](http://en.wikipedia.org/wiki/Hill_climbing) and [genetic algorithms](http://en.wikipedia.org/wiki/Genetic_algorithm). The name means _"(we) will find (it)"_, as in the classical quote from [Hannibal](http://en.wikipedia.org/wiki/Hannibal) _"inveniemus viam aut faciemus"_, which means _"we will find a way or we will make it"_. 

Released under an MIT license, it has been developed since 2012 by [Leonardo Val](https://github.com/LeonardoVal), with contributions by: [Andrés Zeballos](mailto:andreszeballosjuanico@gmail.com), [Gonzalo Martínez](gonzalo.martinez@live.com) and [Mathías Lepratte](mlepratte3108@hotmail.com). It is aimed to the big three environments of Javascript (as of 2013): in a standard browser both embedded inside an HTML page or inside a web worker, or server side with [NodeJS](http://nodejs.org/). 

## Core concepts ###################################################################################

Inveniemus splits searches and optimizations in three core concepts: _elements_, _problems_ and _metaheuristics_. An _element_ is a representation of a member of the search space, also known as a candidate solution. All such representations are based on arrays of numbers, each between a given range provided by an _element model_. This arrays may be converted to another data structure closer to the problem's domain. Still the optimizations shall only deal with the raw numbers. In the library the constructor `Element` implements this concept. 

A _problem_ specifies what the search or optimization is about. Using this framework usually involves defining a new problem object, deriving a subclass of the type `Problem`. It will be responsible for the elements' proper initialization, evaluation and mapping to another data types. It indicates how the elements are compared to each other to find which is the better one. Usually it implies the maximization or minimization of the elements' evaluation, treating that number as a measure of the candidate solutions' quality or errors. Finally, the problem instance decides when an element is sufficient and can be considered a feasible solution. Using this framework usually involves defining a new problem object, which implies declaring a new element type.

Inveniemus' _metaheuristics_ are the implementations of several optimization algorithms, that can be used also for searching. Though the methods are quite different, all implementations share some common features. All methods are iterative, going through a number of steps before meeting a certain finish criteria (e.g. a maximum number of steps). As it runs the metaheuristic carries a set of elements called _state_, usually initialized at random. With each iteration the algorithm tries to improve its state, by modifying elements, discarding them or adding new ones. After every step all elements in the state should be evaluated, and sorted in decreasing order of quality.

## Example #1: Hello world #########################################################################

Our first example is the metaheuristic's [_"hello world"_](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program). This very simple problem is only suitable for demonstration or testing purposes. Defined a target string (e.g. "Hello world!"), the metaheuristic should be able to reach it from any initial state. Elements represent strings of valid characters. Their evaluation is a distance to the target string (e.g. [the euclidean distance](http://mathworld.wolfram.com/Distance.html)). This evaluation has to be minimized in order to reach the target (point of evaluation zero).

We start by defining the `HelloWorldProblem` constructor. In Javascript classes are represented by the functions used to construct its instances. All problems' constructors get a `params` argument, an object with the problems parameters. In this case there is only one: the `target` string. This value is stored in a property of the problem object. A `__target__` property is also added, with an array of the character codes for the target string. The property `__elementModel__` is used to store the problem's element model. Its value is returned by the method `elementModel`. This is an array of objects defining the length of all elements, and the range of each of its values.

```javascript
function HelloWorldProblem(params) {
	inveniemus.Problem.call(this, params); // Call to superclass constructor.
	this.target = params.target;
	this.__target__ = params.target.split('').map(function (chr) {
		return chr.charCodeAt(0);
	});
	this.__elementModel__ = this.__target__.map(function () {
		return { min: 32, max: 126, discrete: true };
	});
}
```

We have to make `HelloWorldProblem` a _subclass_ of `Problem`, or [as close as it can be done in Javascript, at least](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain):

```javascript
HelloWorldProblem.prototype = Object.create(inveniemus.Problem.prototype);
HelloWorldProblem.prototype.constructor = HelloWorldProblem;
(Object.setPrototypeOf || (function (constructor, parent) {
	constructor.__proto__ = parent; // ES5 polyfill for Object.setPrototypeOf.
}))(HelloWorldProblem, inveniemus.Problem);
```

The elements' array of numbers is a representation of the candidate solution, which are strings really. The `mapping` method converts the elements rather abstract representation in one that is closer to the actual search space. Here the element's values is used to map from the [32, 127) range, the visible ASCII characters plus the space. Also, the element class has many methods available to help with mappings.

```javascript
HelloWorldProblem.prototype.mapping = function mapping(element) {
	return element.values.map(function (n) {
		return String.fromCharCode(Math.min(Math.floor(n), 126));
	}).join('');
};
```

All metaheuristics perform some sort of optimization of a quality measure of each element. This is known as the elements' `evaluation`. In this case we calculate a distance from the given element to the problem's target. The distance used here is the [Manhattan distance (also known as the taxicab distance)](http://mathworld.wolfram.com/TaxicabMetric.html). The element class has this and other distances already implemented.

```javascript
HelloWorldProblem.prototype.evaluation = function evaluation(element) {
	return element.manhattanDistance(this.__target__, element.values);
};
```

Since the elements evaluation is a distance to the optimum, in order to get to it the evaluation must be minimized. This is specified by the `objectives` property of the problem object. This property holds an array of objectives, because Inveniemus supports multi-objective optimization. Still most frequently the objective is only one.

Optimization can be done in three possible ways: _maximization_, _minimization_ and _approximation_ (which is actually minimization of the distance to a given value, e.g. zero). In an approximation the value to approximate is the objective. In a maximization the objective is `+Infinity` and in a minimization is `-Infinity`.

```javascript
HelloWorldProblem.prototype.objectives = [-Infinity];
```

Finally, the problem may indicate when an element or list of elements is sufficient, and hence the optimization must stop. To indicate when an element is sufficient implement the `sufficientElement` method. To indicate when a list of elements is sufficient, implement the `sufficientElements` method. By default, a list of elements is sufficient if at least one of its elements is. Here defining the criteria for one element will work.

```javascript
HelloWorldProblem.prototype.sufficientElement = function sufficientElement(element) {
	return this.mapping(element) === this.target;
};
```

This problem can now be used with the metaheuristics provided by Inveniemus. In the following example it would be a random search.

```javascript
(function () {
	var problem = new HelloWorldProblem({ target: "Hello!" }),
		mh = new inveniemus.Metaheuristic({ problem: problem });
	mh.run().then(function () {
		console.log("Best found: "+ mh.state[0] +" "+ JSON.stringify(mh.state[0].mapping()) +".");
	});
})();
```

by [Leonardo Val](http://github.com/LeonardoVal).