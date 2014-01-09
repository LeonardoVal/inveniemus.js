# Source documentation for [inveniemus](http://github.com/LeonardoVal/inveniemus)

A search and optimization library, focusing on metaheuristics.

## `src/Element.js`

Element is the term used in the Inveniemus library for representations of
[candidate solutions](http://en.wikipedia.org/wiki/Feasible_region) in a
search or optimization problem.
### `Element.length=10`:

Size of the element's values array.
### `Element.minimumValue=0`:

Minimum value a number in this element can have.
### `Element.maximumValue=1`:

Maximum value a number in this element can have.
### `Element.random=Randomness.DEFAULT`:

Pseudorandom number generator used by the element.
### `new Element(values=<random values>, evaluation=NaN)`:

An element represents a candidate solution. It is defined by the values
array of numbers, between minimumValue and maximumValue (by default 0
and 1).
### `Element.values`:

An array of numbers that represents a candidate solution.
### `Element.evaluation=NaN`:

The element's evaluation is a measure of its fitness to solve a
problem. It guides almost all of the metaheuristics.
### `Element.randomValue()`:

Returns a random value between this.minimumValue and this.maximumValue.
### `Element.randomValues()`:

Returns an array with random numbers.
### `Element.evaluate()`:

Evaluates this element, assigning its evaluation and returning it. It
can return a Future if the evaluation has to be done asynchronously.

This can be interpreted as the solutions cost in a search problem or the
target function of an optimization problem. The default behaviour is
adding up this element's values, useful only for testing.
### `Element.suffices()`:

Returns true if this element is an actual solution to the problem. It
holds the implementation of the goal test in search problems. More
complex criteria may be implemented in Problem.suffices.

By default it checks if the values add up to zero.
### `Element.mapping()`:

Returns an alternate representation of this element that may be fitter
for evaluation or showing it to the user. By default it just returns the
values array.
### `Element.emblem()`:

The emblem of an element is a string that represents it and can	be
displayed to the user. By default returns the string conversion.
### `Element.resolution=Number.EPSILON`:

Minimum difference between two evaluation to consider them different.
### `Element.hammingDistance(array1, array2)`:

The [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance)
between two arrays is the number of positions at which corresponding
components are different. Arrays are assumed to be of the same
length. If they are not, only the common parts are considered.
### `Element.manhattanDistance(array1, array2)`:

The [Manhattan distance](http://en.wikipedia.org/wiki/Manhattan_distance)
between two arrays is the sum of the absolute differences of
corresponding positions. Arrays are assumed to be of the same length. If
they are not, only the common parts are considered.
### `Element.euclideanDistance(array1, array2)`:

Calculates the [euclidean distance](http://en.wikipedia.org/wiki/Euclidean_distance)
between two arrays. Arrays are assumed to be of the same length. If they
are not, only the common parts are considered.
### `Element.rootMeanSquaredError(f, data)`:

Returns the [root mean squared error](http://en.wikipedia.org/wiki/Root_mean_squared_error)
of the function f on the given data. The data must be an iterable of
arrays, in which the first element is the expected result and the rest
are the arguments for the function.
### `Element.successors()`:

Returns an array with new elements that can be considered adjacent of
this element. By default returns the element's neighbourhood with the
default radius.
### `Element.neighbourhood(radius=1%)`:

Returns an array of new elements, with values belonging to the n
dimensional ball around this element's values.
### `Element.modification(index, value, ...)`:

Returns a new and unevaluated copy of this element, with its values
modified as specified.
### `Element.arrayMapping(items...)`:

Builds an array of equal length of this element's values. Each value is
used to index the corresponding items argument. If there are less
arguments than the element's length, the last one is used for the rest
of the values.
### `Element.setMapping(items)`:

Builds an array of equal length of this element's values. Each value is
used to select one item. Items are not selected more than once.
### `Element.clone()`:

Returns a copy of this element.
### `Element.equals(other)`:

Checks if the other element has the same values and constructor than
this one.

## `src/Problem.js`

The Problem type represents a search or optimization problem in the
Inveniemus library.
### `Problem.title='<no title>'`:

Title of the problem to be displayed to the user.
### `Problem.description='<no description>'`:

Description of the problem to be displayed to the user.
### `Problem.random=Randomness.DEFAULT`:

Pseudorandom number generator used by the problem.
### `Problem.representation=Element`:

Element constructor used for this problem's candidate solutions.
### `new Problem(params)`:

A search/optimization problem definition, holding the representation of
the elements (as an Element constructor), with the comparison and
sufficiency criteria.
### `Problem.compare(element1, element2)`:

Standard comparison function between two elements. Returns a positive
number if element2 is better than element1, a negative number if
element2 is worse then element1, or zero otherwise.

Implements a minimization by default.
### `Problem.suffices(elements)`:

Returns true if inside the elements array there is an actual solution to
the problem. It holds the implementation of the goal test in search
problems.

By default checks if the first element by calling its suffice method.
### `Problem.maximization(element1, element2)`:

Compares two elements by evaluation in descending order.
### `Problem.minimization(element1, element2)`:

Compares two elements by evaluation in ascending order.
### `Problem.approximation(target, element1, element2)`:

Compares two elements by distance of its evaluation to the given target
value in ascending order.
### `problems`:

Bundle of classic and reference problems.

## `src/Metaheuristic.js`

A [Metaheuristic](http://en.wikipedia.org/wiki/Metaheuristic) is an
optimization algorithm (which can also be used for searching).
### `Metaheuristic.logger`:

Logger used by the metaheuristic.
### `new Metaheuristic(params)`:

Base class of all metaheuristic algorithms, and hence of all
metaheuristic runs.
### `Metaheuristic.problem`:

Definition of the problem this metaheuristic will try to solve.
### `Metaheuristic.size=100`:

Amount of candidate solutions the metaheuristic treats at each step.
### `Metaheuristic.state=[]`:

An array holding the elements this metaheuristic handles at each
step.
### `Metaheuristic.steps=100`:

Number of steps this metaheuristic must perform.
### `Metaheuristic.step=-1`:

Current iteration of this metaheuristic, or a negative number if
it has not started yet.
### `Metaheuristic.random=Randomness.DEFAULT`:

This metaheuristic's pseudorandom number generator. It is strongly
advised to have only one for the whole process.
### `Metaheuristic.statistics`:

The statistic gatherer for this metaheuristic.
### `Metaheuristic.events`:

Event handler for this metaheuristic. The emitted events by default
are: initiated, updated, expanded, evaluated, sieved, advanced,
analyzed & finished.
### `Metaheuristic.initiate(size=this.size)`:

Builds and initiates this metaheuristic state with size new cursors. The
elements are build using the initial() function.
### `Metaheuristic.update()`:

Updates this metaheuristic's state. It assumes the state has been
initialized. The process may be asynchronous, so it returns a Future.

The default implementation first expands the state by calling
this.expand(), then evaluates the added elements by calling
this.evaluate(), and finally removes the worst elements with
this.sieve().
### `Metaheuristic.expand(expansion=[])`:

Adds to this metaheuristic's state the given expansion. If none is given,
this.expansion() is called to get new expansion.
### `Metaheuristic.expansion(size)`:

Returns an array of new elements to add to the current state. The
default implementation generates new random elements.
### `Metaheuristic.evaluate(elements)`:

Evaluates all the elements in this.state with no evaluation, using its
evaluation method. After that sorts the state with the compare method
of the problem.

Returns a Future, regardless of the evaluation being asynchronous or
not.
### `Metaheuristic.prototype.sieve(size=this.size)`:

Cuts the current state down to the given size (or this.size by default).

This is usually used after expanding and evaluating the state. The
statistics of this metaheuristic are calculated here, right after the
state is sieved.
### `Metaheuristic.finished()`:

Termination criteria for this metaheuristic. By default it checks if the
number of passed iterations is not greater than this.steps.
### `Metaheuristic.analyze()`:

Updates the process' statistics.
### `Metaheuristic.advance()`:

Performs one step of the optimization. If the process has not been
initialized, it does so. Returns a Future if the run has not finished or
null otherwise.
### `Metaheuristic.run()`:

Returns a Future that is resolved when the whole search process is
finished. The value is the best cursor after the last step.
### `Metaheuristic.reset()`:

Reset the process to start over again. Basically cleans the stats and
sets the current step to -1.
### `metaheuristics`:

Bundle of metaheuristics available.

## `src/metaheuristics/HillClimbing.js`

[Hill Climbing](http://en.wikipedia.org/wiki/Hill_climbing) implementation
for the Inveniemus library.
### `new HillClimbing(params)`:

Builds a [hill climbing](http://en.wikipedia.org/wiki/Hill_climbing)
search.
### `HillClimbing.delta=0.01`:

The radius of the elements surroundings in every dimension, that is
checked by this algorithm.
### `HillClimbing.size=1`:

Default value for size is 1.
### `HillClimbing.update()`:

Each element in the state is replaced by the best element in its
neighbourhood, if there is any. The surroundings have all possible
elements resulting from either an increment or decrement (of the given
delta) in each of the centre element's dimensions.
### `HillClimbing.atLocalOptima()`:

Checks if the search is currently stuck at local optima.
### `HillClimbing.finished()`:

Hill climbing search must finish when a local optimum is reached. This
criteria is tested together with all others.

## `src/metaheuristics/GeneticAlgorithm.js`

Classic Holland's-style [genetic algorithms](http://en.wikipedia.org/wiki/Genetic_algorithm)
for the Inveniemus library.
### `new GeneticAlgorithm(params)`:

Builds a genetic algorithm, the base for many evolutionary computing
variants.
### `GeneticAlgorithm.expansionRate=0.5`:

The amount of new elements generated by crossover, as a ratio of the
population size.
### `GeneticAlgorithm.mutationRate=0.2`:

The chance of a new element (resulting from crossover) mutating.
### `GeneticAlgorithm.selection(count)`:

Selects count elements from the current population. These will be
the parents of the new elements in the next generation.

By default rank selection is used, a.k.a. fitness proportional
to position in the state.
### `GeneticAlgorithm.crossover(parents)`:

Genetic operator that simulates reproduction with inheritance. The
parents argument must be an array of elements. The result is an
array of elements.

By default the single point crossover is used.
### `GeneticAlgorithm.mutation(element)`:

Genetic operator that simulates biological mutation, making a random
change in the chromosome.

By default a single point uniform mutation is used.
### `GeneticAlgorithm.expansion()`:

Returns the possibly mutated crossovers of selected elements. How many
is determined by this.expansionRate.
### `static GeneticAlgorithm.selections`:

Bundle of standard selection methods. A selection function takes the
amount of elements to be selected and returns an array of selected
elements.
### `GeneticAlgorithm.selection.rankSelection(count=2)`:

Makes a selection where each element's probability of being selected is
proportional to its position in the state.
### `GeneticAlgorithm.selections.rouletteSelection(count=2)`:

Makes a selection where each element's probability of being selected is
proportional to its evaluation.

Warning! This selection assumes the evaluation is being maximized.
### `GeneticAlgorithm.crossovers`:

Bundle of standard crossover methods. A crossover function takes an
array of parent elements and returns an array of sibling elements.
### `GeneticAlgorithm.crossovers.singlepointCrossover(parents)`:

Given two parents, returns an array of two new elements built with one
half of each parent. The cutpoint is chosen randomly.
### `GeneticAlgorithm.mutations`:

Bundle of standard mutation methods.
### `GeneticAlgorithm.mutations.singlepointUniformMutation(element)`:

Sets a randomly selected gene to a uniform random value.
### `GeneticAlgorithm.mutations.uniformMutation(maxPoints=Infinity)`:

Builds a mutation function that makes at least one and up to maxPoints
mutations, changing a randomly selected gene to a uniform random value.
### `GeneticAlgorithm.mutations.singlepointBiasedMutation(element)`:

Sets a randomly selected gene to random deviation of its value, with a
triangular distribution.

## `src/metaheuristics/BeamSearch.js`

[Beam search](http://en.wikipedia.org/wiki/Beam_search) implementation for
the Inveniemus library. It is a form of parallel best-first search with
limited memory.
### `new BeamSearch(params)`:

Builds a beam search. The problem's element must have its successors
method implemented.
### `BeamSearch.successors(element)`:

Returns the elements' successors. By default returns
element.successors().
### `BeamSearch.expansion()`:

Successors to all elements are calculated by calling the problem's
successors method.

## `src/metaheuristics/SimulatedAnnealing.js`

[Simulated annealing](http://en.wikipedia.org/wiki/Simulated_annealing)
implementation for the Inveniemus library.
### `new SimulatedAnnealing(params)`:

Builds a simulated annealing search.

See <http://en.wikipedia.org/wiki/Simulated_annealing>.
### `SimulatedAnnealing.maximumTemperature=1`:

The temperature at the start of the run.
### `SimulatedAnnealing.minimumTemperature=1`:

The temperature at the end of the run.
### `SimulatedAnnealing.delta=0.01`:

The radius of the elements surroundings in every dimension, that is
checked by this algorithm.
### `SimulatedAnnealing.size=1`:

Default value for size is 1.
### `SimulatedAnnealing.randomNeighbour(element, radius=this.delta)`:

Returns one neighbour of the given element chosen at random.
### `SimulatedAnnealing.acceptance(current, neighbour, temp=this.temperature())`:

Returns the probability of accepting the new element. Uses the original
definitions from Kirkpatrick's paper.
### `SimulatedAnnealing.temperature()`:

Returns the current temperature of the annealing.
### `SimulatedAnnealing.update()`:

For each element in the state one of its neighbours is chosen randomly. If
the neighbour is better, it replaces the corresponding element. Else it
may still do so, but with a probability calculated by this.acceptance().

## `src/problems/SumOptimization.js`

A class of very simple problems that deal with optimizing the sum of the
elements' values. Probably the simplest optimization problem that can be
defined, included here for testing purposes.
### `new problems.SumOptimization(params)`:

Very simple problem based on optimizing the elements' values sum. The
params argument should include the 'target' number.
### `problems.SumOptimization.suffices(elements)`:

Checks if the best element's values add up to the target value.
### `problems.SumOptimization.compare(element1, element2)`:

The comparison between elements depends on this problem's target. For
a Infinity maximization is applied, for -Infinity minimization, and
for every other number approximation.

## `src/problems/HelloWorld.js`

As it sounds, HelloWorld is a simple problem class, probably only useful for
testing purposes.
### `new problems.HelloWorld(params)`:

Simple problem where each element is a string, and the optimization
goes towards the target string. The string to match is specified by the
'target' parameter.

## `src/problems/NQueensPuzzle.js`

A generalized version of the classic [8 queens puzzle](http://en.wikipedia.org/wiki/Eight_queens_puzzle).
### `new problems.NQueensPuzzle(params)`:

Generalized version of the classic problem of placing 8 chess queens on
an 8x8 chessboard so that no two queens attack each other. The amount
of queens and board dimensions is specified by the N parameter.
### `problems.NQueensPuzzle.representation`:

The representation is an array of N positions, indicating the row of
the queen for each column. Its evaluation is the count of diagonals
shared by queens pairwise.

## `src/problems/KnapsackProblem.js`

The [Knapsack problem](http://en.wikipedia.org/wiki/Knapsack_problem) is a
classic combinatorial optimization problem. Given a set of items, each with
cost and worth, a selection must be obtained (to go into the knapsack) so
that the total cost does not exceed a certain limit, while maximizing the
total worth.
### `problems.KnapsackProblem.items`:

The superset of all candidate solutions. Must be an object with each
item by name. Each item must have a cost and a worth, and may have an
amount (1 by default).
### `new problems.KnapsackProblem(params)`:

Classic combinatorial optimization problem, based on a given a set of
items, each with a cost and a worth. The solution is a subset of items
with maximum worth sum that does not exceed a cost limit.
### `problems.KnapsackProblem.limit=15`:

Cost limit that candidate solution should not exceed.
### `problems.KnapsackProblem.defaultAmount=1`:

Amount available for each item by default.
### `problems.KnapsackProblem.representation`:

The representation is an array with a number for each item. This
number holds the selected amount for each item (from 0 up to the
item's amount).


---

By [Leonardo Val](leonardo.val@creatartis.com>). Generated 2014-01-09 16:31:24.