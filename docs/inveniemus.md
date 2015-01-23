# Inveniemus

Inveniemus is a search and optimization library for Javascript. It focuses on a particular class of optimization techniques, called [metaheuristics](http://en.wikipedia.org/wiki/Metaheuristic), which include algorithms like [Hill climbing search](http://en.wikipedia.org/wiki/Hill_climbing) and [Genetic algorithms](http://en.wikipedia.org/wiki/Genetic_algorithm). The name means _"(we) will find (it)"_, as in the classical quote from Hannibal _"inveniemus viam aut faciemus"_, which means _"we will find a way or we will make it"_. Released under an MIT license, it has been developed since 2012 by [Leonardo Val](https://github.com/LeonardoVal), with contributions by: [Andrés Zeballos](mailto:andreszeballosjuanico@gmail.com), [Gonzalo Martínez](gonzalo.martinez@live.com) and [Mathías Lepratte](mlepratte3108@hotmail.com). It is aimed to the big three environments of Javascript (as of 2013): in a standard browser both embedded inside an HTML page or inside a web worker, or server side with [NodeJS](http://nodejs.org/). 

## Core concepts

Inveniemus splits searches and optimizations in three core concepts: elements, problems and metaheuristics. An _element_ is a representation of a member of the search space, hence a candidate solution. All such representations in Inveniemus are based on arrays of numbers, with a fixed length and values between a given range (0 and 1 by default). This arrays may be converted to another data structure closer to the problem's domain. Still the optimizations shall only deal with the raw numbers. Element types are responsible for their initialization, assessment and mapping to another data types.

A _problem_ in Inveniemus specifies what the search is about. First it contains the element type used as a representation for candidate solutions. Secondly it defines how this solutions are compared to each other to find which is the better one. Usually it implies the maximization or minimization of the elements' evaluation, treating that number as a measure of the candidate solutions' quality or errors. Finally it decide when an element is sufficient and can be considered a feasible solution. Using this framework usually involves defining a new problem object, which implies declaring a new element type.

Inveniemus' _metaheuristics_ are the implementation of several optimization algorithms, that can be used also for searching. Though the methods are quite different, all implementations share some common features. All methods are iterative, going through a number of steps before meeting a certain finish criteria (at least a maximum number of steps). As it runs the metaheuristic carries a set of elements called _state_, usually initialized at random. With each iteration the algorithm tries to improve its state, by modifying or discarding elements or adding new ones. After every step all elements in the state should be evaluated, and sorted in decreasing order of fitness.

## Example

**TODO**.
