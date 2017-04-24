# Generators

* [Syntax](#syntax)
    * [yield](#yield)
    * [yield*](#yield-1)
* [Generators as Iterators](#generators-as-iterators)
    * [Return](#return)
    * [Throw](#throw)
* [Generators as Data Consumers](#generators-as-data-consumers)
* [Use Cases](#use-cases)
    * [Implement Iterables](#implement-iterables)
    * [Asynchronous Code](#asynchronous-code)
* [Conclusion](#conclusion)

## Introduction

`Generators` are an implementation of `iterables`.

The big deal about `generators` is that **they are functions that can suspend its execution while maintaining the context**.

This behaviour is crucial when dealing with executions that need to be paused, but its context maintained, in order to recover it in the future.

Does async development sounds familiar?

## Syntax

`Generators` syntax reminds of pointers in `C`, however there's nothing that relates both :bowtie:

The syntax for `generators` starts with it's `function*` declaration (please not the `asterisk`) and the `yield` through which a `generator` can pause it's execution.

```js
function* generator() {
    // A
    yield 'foo'
    // B
}
```

Calling our `generator` function creates new generator that we can use to control the process through `next` function.

Running `next` will execute our `generetor`'s code until an `yield` expression is reached.

At this point the value on `yield` is emitted and the `generator`'s execution is suspended.

```js
const g = generator()

g.next() // { value: 'foo', done: false }
// Our generator's code A gets executed
// and our value 'foo' gets emitted through yield.
// After this, our generator's execution gets suspended.

g.next() // { value: undefined, done: true }
// At this stage the remaining code (i.e. B) gets executed.
// Because no value is emitted we get 'undefined' as the value,
// and the iterator returns 'true' for iteration done.
```

### yield

`yield` was born with `generators` and allow us to emit values. However, we can only do this while we are inside a `generator`.

If we try to `yield` a value on a callback, for instance, even if declared inside the `generator`, we will get an error.

```js
function* generator() {
    ['foo','bar'].forEach(e => yield e) // SyntaxError
    // We can't use 'yield' inside a non-generator function.
}
```

### yield*

`yield*` was built to enable calling a `generator` within another `generator`.

```js
function* foo() {
    yield 'foo'
}

// How would we call 'foo' generator inside the 'bar' generator?
function* bar() {
    yield 'bar'
    foo()
    yield 'bar again'
}

const b = bar();

b.next() // { value: 'bar', done: false }
b.next() // { value: 'bar again', done: false }
b.next() // { value: undefined, done: true }
```

Our `b` iterator, produced by `bar` generator, does not work as expected when calling `foo`.

This is because, although the execution of `foo` produces an iterator, we do not iterate over it.

That's why ES6 brought the operator `yield*`.

```js
function* bar() {
    yield 'bar'
    yield* foo()
    yield 'bar again'
}

const b = bar();

b.next() // { value: 'bar', done: false }
b.next() // { value: 'foo', done: false }
b.next() // { value: 'bar again', done: false }
b.next() // { value: undefined, done: true }
```

This works perfectly with data consumers.

```js
for (let e of bar()) {
    console.log(e)
    // bar
    // foo
    // bar again
}

console.log([...bar()]) // [ 'bar', 'foo', 'bar again' ]
```

Internally `yield*` goes over every element on the generator and `yield` it.

```js
function* bar() {
    yield 'bar'
    for (let e of foo()) {
        yield e
    }
    yield 'bar again'
}
```

## Generators as Iterators

`Generators` are simple `iterables`, which means that they follow the `iterable` and `iterator` protocols:

* The `iterable` protocol says that an object should return a function `iterator` whose key is `Symbol.iterator`.
```js
const g = generator()

typeof g[Symbol.iterator] // function
```

* The `iterator` protocol says that the `iterator` should be an object pointing to the next element of the iteration.
This object should contain a function called `next`.
```js
const iterator = g[Symbol.iterator]()

typeof iterator.next // function
```

Because `generators` are `iterables` then we can use a data consumer, e.g. `for-of`, to iterate over `generators` values.
```js
for (let e of iterator) {
    console.log(e)
    // 'foo'
}
```

### Return

We can add a `return` statement to our `generator`, however `return` will behave differently according to the way `generators`' data is iterated.

```js
function* generatorWithReturn() {
    yield 'foo'
    yield 'bar'
    return 'done'
}

var g = generatorWithReturn()

g.next() // { value: 'foo', done: false }
g.next() // { value: 'bar', done: false }
g.next() // { value: 'done', done: true }
g.next() // { value: undefined, done: true }
```

When performing the iteration by hand, using `next`, we get our returned value (i.e. `done`) as the last value of our iterator object and our `done` flag as true.

On the side, when using a defined data consumer such as `for-of` or `destructuring`, the returned value is ignored.

```js
for (let e of g) {
    console.log(e)
    // 'foo'
    // 'bar'
}

console.log([...g]) // [ 'foo', 'bar' ]
```

#### yield*

We saw that `yield*` allows us to call a `generator` inside a `generator`.

It also allow us to store the value returned by the executed `generator`.

```js
function* foo() {
    yield 'foo'
    return 'foo done'
}

function* bar() {
    yield 'bar'
    const result = yield* foo()
    yield result
}

for (let e of bar()) {
    console.log(e)
    // bar
    // foo
    // foo done
}
```

### Throw

We can `throw` inside a generator and `next` will propagate our exception.

As soon as an exception is thrown the iterator flow breaks and it's state is set to `done: true` indefinitely.

```js
function* generatorWithThrow() {
    yield 'foo'
    throw new Error('Ups!')
    yield 'bar'
}

var g = generatorWithReturn()

g.next() // { value: 'foo', done: false }
g.next() // Error: Ups!
g.next() // { value: undefined, done: true }
```

## Generators as Data Consumers

Besides `generators` being data producers, through `yield`, they also have the ability to consume data using `next`.

```js
function* generatorDataConsumer() {
    // A
    console.log('Ready to consume!')
    while (true) {
        const input = yield; // B
        console.log(`Got: ${input}`)
    }
}
```

There's some interesting points to explore here.

1. Generator Creation

```js
var g = generatorDataConsumer()
```

At this stage we are creating our generator `g`.

Our execution stops at point `A`.

2. First `next`

```js
g.next() // { value: undefined, done: false }
// Ready to consume!
```

The first execution of `next` gets our `generator` to be executed until the first `yield` statement.

On this first execution any value sent through `next` is ignored. This is because there's no `yield` statement until the first `yield` statement :trollface:

Our execution suspends at `B` waiting for a value to be filled to `yield`.

3. Next `next`

```js
g.next('foo') // { value: undefined, done: false }
// Got: foo
```

On the next executions of `next` our `generator` will run the code until the next `yield`.

In our case, it logs the value that is got through `yield` (i.e. `Got: foo`) and it gets suspended again on `yield`.

## Use Cases

### Implement Iterables

Because `generators` are an `iterable` implementation, when created we get an `iterable` object, where each `yield` represents the value to emitted on each `iteration`. This description allow us to use `generators` to create `iterables`.

The following example represents a `generator` as `iterable` that iterates over even numbers until `max` is reached. Because our `generator` returns an `iterable` we can use `for-of` to iterate over the values.

It's useful to remember that `yield` pauses the `generator`'s execution, and on each iteration the `generator` resumes from where it was paused.

```js
function* evenNumbersUntil(max) {
    for (let value = 0; value <= max; value += 2) {
        // When 'value' is even we want to 'yield' it
        // as our next value in the iteration.
        if (value % 2 === 0) yield value;
    }
}

// We can now user 'for-of' to iterate over the values.
for (let e of evenNumbersUntil(10)) {
    console.log(e)
    // 0
    // 2
    // 4
    // 6
    // 8
    // 10
}
```

### Asynchronous Code

We can use `generators` to better work with `async` code, such as `promises`.

This use case it a good introduction to the new `async / await` on ES8.

Next is an example of fetching a JSON file with `promises` as we know it. We will use [Jake Archibald](https://twitter.com/jaffathecake) example on  [developers.google.com](https://developers.google.com/web/fundamentals/getting-started/primers/promises).

```js
function fetchStory() {
    get('story.json')
    .then(function (response) {
        return JSON.parse(response)
    })
    .then(function (response) {
        console.log('Yey JSON!', response)
    })
}
```

Using [co library](https://github.com/tj/co) and a `generator` our code will look more like synchronous code.

```js
const fetchStory = co.wrap(function* () {
    try {
        const response = yield get('story.json')
        const text = yield JSON.parse(response)
        console.log('Yey JSON!', response)
    }
})
```

As for the new `async / await` our code will look a lot like our previous version.

```js
async function fetchStory() {
    try {
        const response = await get('story.json')
        const text = await JSON.parse(response)
        console.log('Yey JSON!', response)
    }
}
```

## Conclusion

This is schema, made by [Axel Rauschmayer](https://twitter.com/rauschma) on [Exploring ES6](http://exploringjs.com/es6/index.html) show us how `generators` relate with `iterators`.

![Generator Inheritance](http://exploringjs.com/es6/images/generators----generator_inheritance_150dpi.png)

`Generators` are an implementation of `iterables` and follow the `iterable` and `iterator` protocol. Therefore they can be used to build `iterables`.

The most amazing thing about `generators` is their ability to suspend their execution. For this ES6 brings a new statement called `yield`.

However, calling a `generator` inside a `generator` is not as easy as executing the `generator` function. For that, ES6 has `yield*`.

`Generators` are the next step to bring asynchronous development close to synchronous.

## Thanks to :beers:

* [Axel Rauschmayer](https://twitter.com/rauschma) for his [Exploring ES6 - Generators](http://exploringjs.com/es6/ch_generators.html)
* [Nicolás Bevacqua](https://twitter.com/nzgb) for his [PonyFoo - ES6 Generators in Depth](https://ponyfoo.com/articles/es6-generators-in-depth)
* [Jake Archibald](https://twitter.com/jaffathecake) for his promises example on [developers.google.com](https://developers.google.com/web/fundamentals/getting-started/primers/promises)
