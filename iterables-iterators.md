# Iterables and Iterators

* [Protocol](#protocol)
* [Iterability](#iterability)
    * [Iterable Data Sources](#iterable-data-sources)
* [Implement Iterables](#implement-iterables)
    * [Iterator as an Iterable](#iterator-as-an-iterable)
    * [Return and Throw](#return-and-throw)

## Introduction
ES6 introduces a new way to interact with Javascript data structures - `iteration`.

With `iteration` comes two core concepts:
* `Iterable` - described by a data structure that provides a way to expose its data to the public. This is done by implementing a method whose key is `Symbol.iterator`. `Symbol.iterator` is nothing else than a factory of iterators.
* `Iterator` - described by a structure that contains a pointer to the next element in the iteration (think of it as an element of a linked list).

## Protocol

Both `iterable` and `iterator` follow a protocol that enables objects to be iterable.

* An `interable` must be an object with a function `iterator` whose key is `Symbol.iterator`.
```js
const iterable = {
    [Symbol.iterator](): iterator
}
```
* An `iterator` must be an object with a function named `next` that returns an object with the keys:
    * `value` - the current item in the iteration.
    * `done` - `true` if the iteration has finished, `false` otherwise.

 ```js
 const iterator = {
     next() {
         value: any,
         done: boolean
     }
 }
 ```

## Iterability

`Iterability` follows the idea of data sources and data consumers:
* `data sources` - are the place from where the data consumers can get their data.

    For instance, an `Array` such as `[1,2,3]` is a data source structure that holds the data through which a data consumers will iterate (e.g. `1, 2 and 3`).

    More examples are `String`, `Maps` and `Sets`.

* `data consumers` - are the ones that consume the data from data sources.

    For instance, the `for-of` loop is a data consumer able to iterate over an `Array` data source.

    ```js
    for (let e of [1,2,3]) {
        console.log(e)
        // 1
        // 2
        // 3
    }
    ```

    More examples are the `spread operator` and  `Array.from`.

A structure to be a `data source` needs to allow and say how its data should be consumed. This is done through `iterators`.

Therefore, a `data source` needs to follow the iterator protocol described above.

However, because it's not practical for every `data consumer` to support all `data sources`, especially when Javascript allows us to build our own data sources, ES6 introduces the interface `Iterable`.

> **Basically, data consumers consume the data stored on data sources through iterables.**

#### In Practice

Let's see how this works on a defined data source - `Array`.

```js
const array = ['foo','bar','zed']

// Array is a data source because it implements an iterator.
console.log(typeof array[Symbol.iterator]) // function

// We first get the iterator which allow us to iterate (i.e. consume) over the array values.
const iterator = array[Symbol.iterator]()

// The iterator follows the protocol of being an object with the 'next' function.
console.log(typeof iterator.next) // function

// Calling .next() returns the next element in the iteration.
iterator.next() // { value: 'foo', done: false }
iterator.next() // { value: 'bar', done: false }
iterator.next() // { value: 'zed', done: false }
// Until there's no more elements to iterate, which then returns 'done' as true.
iterator.next() // { value: undefined, done: true }
```

### Iterable Data Sources

We will use `for-of` to explore some of the data sources that implement the `iterable` protocol.

* Arrays
```js
for(let e of ['foo','bar']) {
    console.log(e)
    // 'foo'
    // 'bar'
}
```

* Strings
```js
for(let c of 'foo') {
    console.log(c)
    // f
    // o
    // o
}
```

* Maps *(Weakmaps are not iterable)*
```js
for(let pair of new Map([['foo', 'Mr.Foo'], ['bar', 'Mr.Bar']])) {
    console.log(pair)
    // [ 'foo', 'Mr.Foo' ]
    // [ 'bar', 'Mr.Bar' ]
}
```

* Sets *(Weaksets are not iterable)*
```js
for(let e of new Set(['foo','bar'])) {
    console.log(e)
    // 'foo'
    // 'bar'
}
```

* *arguments*

    ```js
    function foo() {
        for(let e of arguments) {
            console.log(e)
        }
    }

    foo('bar','zed')
    // 'bar'
    // 'zed'
    ```

#### Plain Objects

At this stage we need to say that plain objects are not `iterable`.

[Axel Rauschmayer](https://twitter.com/rauschma) does a great work on [Exploring ES6](http://exploringjs.com/es6/) explaining why.

A brief explanation would be that we can iterate over a Javascript objects at two different levels:
* `program level` - which means iterating over an object properties that represent it's structure.

    For instance, `Array.prototype.length`, where `length` is related with the object's structure and not it's data.

* `data level` - meaning iterating over a data structure and extracting its data.

    For instance, for our `Array` example, that would mean iterating over the array's data. If `array = [1,2,3,4]`, iterate over the values `1, 2, 3 and 4`.

However, bringing the concept of iteration into plain objects means mixing-up program and data structures. The problem with plain objects is everyones' ability to create their own objects.

```js
let Hugo = {
    fullName: 'Hugo Matias',
    toString()  {
        return `${this.fullName}`
    }
}
```

*In our `Hugo`'s case I would Javascript distinguish between the data level, i.e. `Hugo.fullName`, and the program level, i.e. `Hugo.toString()`?*

While it is possible to distinguish between the two levels of iteration on well-defined structures, such as `Arrays`, it's impossible to do so for any object.

This is why we get iteration for free on `Arrays` (also on `String`, `Maps`, and so) but not on plain objects.

We can, however, implement our own `iterables`.

## Implement Iterables

We can build our own `iterables`, although we usually use generators for that (but we will leave generators for the next time.)

In order to build our an `iterable` we need to follow the iteration protocol, which says:

* An object becomes an `iterable` if it implements a function whose key is `Symbol.iterator` and returns an `iterator`.

* The `iterator` itself is an object with a function called `next` inside it. `next` should return an object with two keys `value` and `done`. `Value` contains the next element of the iteration and `done` a flag saying if the iteration has finished.

### Example

```js
const iterable = {
    [Symbol.iterator]() {
        let data = ['foo','bar']
        return { // Iterator
            next() {
                return {
                    done: data.length === 0,
                    value: data.pop()
                }
            }
        }
    }
}

for(let e of iterable) {
    console.log(e)
    // 'foo'
    // 'bar'
}
```

Our `iterable` implementation is very simple. We have followed the `iterable` protocol and on each iteration the `for-of` loop will ask the iterator for the `next` element.
Our iterator will return on `next` an object containing the following by iteration:
* Iteration 1
```js
{
    value: 'foo',       // The first element on the array.
    done:  false        // Iteration has not finished yet.
}
```
* Iteration 2
```js
{
    value: 'foo',       // The second element on the array.
    done:  false        // Iteration has not finished yet.
}
```
* Iteration 3
```js
{
    value: undefined,   // The array has no more elements.
    done:  true         // Iteration has finished.
}
```

Please note that we switch the order of the our properties `next` and `done` for convenience.
Having `next` first it would break the implementation since we will first pop an element and then count the elements.

It is useful to know that `done` is `false` by default, which means that we can ignore it when that's the case.
The same is true for `value` when `done` is `true`.
We will see that in a minute.

### Iterator as an Iterable

We could build our `iterator` as an `iterable`.

```js
const iterable = {
    data: ['foo','bar'],
    next() {
        return {
            done: this.data.length === 0,
            value: this.data.pop()
        }
    },
    [Symbol.iterator]() {
        // Return the iterable itself.
        return this
    }
}
```
Please note that this is the pattern followed by ES6 built-in iterators.

**Why is this a useful?**

Although `for-of` only works with `iterables`, not with `iterators`, being the same means that we can pause the execution of `for-of` and continue afterwords.

```js
const array = ['foo', 'bar', 'zed']
const iterator = array[Symbol.iterator]()

for(let e of iterator) {
    console.log(e)
    break
    // 'foo'
}

for(let e of iterator) {
    console.log(e)
    // 'bar'
    // 'zed'
}
```

### Return and Throw

There are two optional `iterator` methods that we haven't explore yet:

#### Return

`return()`` gives the `iterator` the opportunity to clean up the house when it breaks unexpectedly.

When we call `return` on an `iterator` we are specifying that we don't plan to call `next` anymore.

```js
const iterable = {
    done: false,
    data: ['foo','bar','zed'],
    next() {
        done = this.done || this.data.length === 0
        return done ?
        // After 'return' is called the object returned by 'next' should also be done.
        {
            done: true
            // We can ignore the 'value' when 'done' is 'true'.
        } :
        {
            value: this.data.pop()
            // We can ignore 'done' when is 'false'.
        }
    },
    // Not all iterators implement the return method.
    // Those who implement are called closable.
    // The 'return' method should return an object { done: true, value: _any_ }.
    return() {
        this.done = true
        return {
            done: true
        }
    },
    [Symbol.iterator]() {
        return this
    }
}

const iterator = iterable[Symbol.iterator]()
iterator.next()     // { done: false, value: 'zed' }
iterator.return()   // { done: true }
iterator.next()     // { done: true }
```

#### Throw

`throw()` is only applied to generators. We will see that when we play with generators.

## Conclusion

ES6 brings `iteration` as a new way to iterate over Javascript data structures.

For iteration to be possible there are `data producers`, who contain the data, and `data consumers`, who take that data.

In order for this combination to work smoothly `iteration` is defined by a protocol, which says:
* An `iterable` is an object that implements a function whose key is `Symbol.iterator` and returns an `iterator`.
* An `iterator` is an object with a function called `next` inside it. `next` is an object with two keys `value` and `done`.
`Value` contains the next element of the iteration and `done` a flag saying if the iteration has finished.

Plain objects are not `iterable` since there's no easy way to distinguish between program and data level iteration.

That's why ES6 offers a way to build our own iterators by following the `iterator` protocol.

## Thanks to :beers:
* [Axel Rauschmayer](https://twitter.com/rauschma) on his [Exploring ES6 - Iteration](http://exploringjs.com/es6/ch_iteration.html)
* [Nicolás Bevacqua](https://twitter.com/nzgb) on his [PonyFoo - ES6 Iterators in Depth](https://ponyfoo.com/articles/es6-iterators-in-depth)
