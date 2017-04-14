ES6 introduces a new way to interact with Javascript data structures - `iteration`.

With iteration comes two core concepts:
* `Iterable` - described by a data structure that provides a way to expose its data to the public. This is done by implementing a method whose key is a `Symbol.iterator`. Symbol.iterator is nothing else than a factory of iterators.
* `Iterator` - described by a structure that contains a pointer to the next element in the data structure (think of it as an element of a linked list).

## Protocol

Both `iterable` and `iterator` follow a protocol that enable objects to be iterable, mainly:
* An `interable` must be an object with a function `iterator` whose key is a `Symbol.iterator`.
```js
const iterable = {
    [Symbol.iterator](): iterator
}
```
* An `iterator` must be an object with a function named `next` that return an object with the keys:
 * `value` - the current item in the sequence.
 * `done` - `true` if the sequences has finished, `false` otherwise.

 ```js
 const iterator = {
     next() {
         value: any,
         done: boolean
     }
 }
 ```

## Iterability

Iterability follows the idea of data sources and data consumers:
* `data source` - represent the place from where the data consumers can get their data. For instance, an `Array` (e.g. [1,2,3]) is a data source structure that holds the data through which a data consumers will iterate (e.g. 1,2,3). More examples are String, Maps and Sets.
* `data consumer` - on the other hand, data consumers are the ones that consume the data from data sources. For instance, the `for-of` loops are data consumers able to iterate over an Array data source. More examples are spread operator and  Array.from.

A structure to be a data source needs to allow and say how its data should be consumed. This is done through iterators. Therefore, in order to be a data source, a data structure needs to follow the iterator protocol described above.

Because it's not practical for every data consumer to support all data sources, especially when Javascript allows us to build our data sources, ES6 introduces the interface `Iterable`.

**Basically, data consumers consume the data stored on data sources through iterables.**

Let's see how this works on the defined data source - `Array`.
```js
const array = ['foo','bar','zed']

// Array is a data source because it implements an iterator:
console.log(typeof array[Symbol.iterator]) // function

// Get the iterator which allow us to iterate (i.e. consume) the array values.
const iterator = array[Symbol.iterator]()

// The iterator follows the convention of being an object with the 'next' function.
console.log(typeof iterator.next) // function

// Calling .next() returns the next element in the iteration.
iterator.next() // { value: 'foo', done: false }
iterator.next() // { value: 'bar', done: false }
iterator.next() // { value: 'zed', done: false }
// Until there's no more elements to iterate, which returns 'done' as true.
iterator.next() // { value: undefined, done: true }
```

### Iterable data sources
We will use `for-of` data consumer to explore the some data source that implement the iterable protocol:
* Arrays
```js
for(const e of ['foo','bar']) {
    console.log(e)
    // 'foo'
    // 'bar'
}
```
* Strings
```js
for(const c of 'foo') {
    console.log(c)
    // f
    // o
    // o
}
```
* Maps (Weakmaps are not iterable)
```js
for(const pair of new Map([['foo', 'Mr.Foo'], ['bar', 'Mr.Bar']])) {
    console.log(pair)
    // [ 'foo', 'Mr.Foo' ]
    // [ 'bar', 'Mr.Bar' ]
}
```
* Sets (Weaksets are not iterable)
```js
for(const e of new Set(['foo','bar'])) {
    console.log(e)
    // 'foo'
    // 'bar'
}
```
* `arguments`
```js
function foo() {
    for(const e of arguments) {
        console.log(e)
    }
}
foo('bar','zed')
// 'bar'
// 'zed'
```
#### Plain Objects
As all known data structures look iterable we need the say that plain objects are not iterable.

Axel Rauschmayer does a great work on Exploringjs explaining why this is.

A brief explanation would be that we can iterate over a Javascript object at two different levels:
* `program level` - which means iterating over an object properties that represent it's structure, for instance, Array.prototype.length, where length is related with the object structure and not it's data.
* `data level` - meaning iterate over a data structure and extract its data. For instance, for our Array example, that would mean iterate over the array's data, if array=[1,2,3,4], iterate over the values 1,2,3 and 4.

However, bringing the concept of iteration into any object means mixing-up program and data structures. The problem with objects is everyones' ability to create their own objects. While it is is simple to distinguish between these two levels of program and data on a well-known structures, for instance, Arrays, it's impossible to do for any object level.

It's important to notice that most of the times we use objects as Maps, which we now have in ES6 and are iterable for free.

## Implement Iterables

We can build our own iterables, but usually we use generators for that. But we will get into that the next time.

In order to build our an iterable we need to follow the iteration protocol, and the protocol says that:
An object becomes an iterable if it implements a function whose key is `Symbol.iterator`, which must return an iterator.
The iterator itself is an object with a method called `next` inside it. This `next` method returns an object with two keys `value` and `done`. `Value` contains the next value on the iterator and `done` the flag saying if the iteration has finished.

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

for(const e of iterable) {
    console.log(e)
    // 'foo'
    // 'bar'
}
```

Our iterable implementation is very simple, we have followed the iterable protocol and on each iteration the `for-of` loop (a data consumers) will ask the iterator for the `next` element. Our iterator will return on next an object containing the follow by iteration:
* Iteration 1
```js
{
    value: 'foo',       // the first element on our Array
    done:  false        // our iteration has not finished yet
}
```
* Iteration 2
```js
{
    value: 'foo',       // the second element on our Array
    done:  false        // our iteration has not finished yet
}
```
* Iteration 3
```js
{
    value: undefined,   // the array has no more element
    done:  true         // our iteration has finished
}
```

Please not that we switch the order of the our properties `next` and `done` on the implementation for convenience.
Having the `next` first it would break the implementation since we will first pop an element and then count the elements.

It's useful to know that `done` is false by default, which means that we can ignore it when that's the case. The same is true for `value` when `done` is true.

### Iterator as an iterable
We could build our iterator as an iterable.
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
Although `for-of` only works with iterables, not with iterators, being the same means that we can pause the execution of a `for-of` loop and continue afterwords.
```js
const array = ['foo', 'bar', 'zed']
const iterator = array[Symbol.iterator]()

for(const e of iterator) {
    console.log(e)
    break;
    // 'foo'
}

for(const e of iterator) {
    console.log(e)
    // 'bar'
    // 'zed'
}
```

### Return and throw

There are two optional iterator methods that we haven't explore which also take some part on this iterator idea:
* `return()` - give the iterator the opportunity to clean the house when it breaks unexpectedly. When calling return on an iterator we are specifying that we don't plan to call the `next` method anymore.

```js
const iterable = {
    done: false,
    data: ['foo','bar','zed'],
    next() {
        done = this.done || this.data.length === 0
        return done ?
        // After the 'return' is called the objects returned by 'next' should also be done.
        {
            done: true
            // We can ignore the 'value' when 'done' is true.
        } :
        {
            value: this.data.pop()
            // We can ignore 'done' when its value is to be false.
        }
    },
    // Not all iterators implement the return method.
    // Those who implement are called closable.
    // The 'return' method should return an object { done: true, value: x }.
    return() {
        this.done = true
        return {
            // When 'return' is called the iteration is set as done.
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
* throw() .... -  is about forwarding a method call to a generator that is iterated over via yield*. It is explained in the chapter on generators.
