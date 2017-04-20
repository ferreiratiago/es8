# Generators

Generators are just an implementation of iterables. When developing a generator we are actually developing a kind of interable.

The big deal about generators is that they are `functions` that can suspend its execution while maintaining the context, which is amazing when dealing with executions that need be paused but its context needs to be maintained. Does async development sounds familiar?

## Syntax

Generators syntax reminds of pointers in `C`, however there's nothing that relates both :bowtie:

The new syntax for generators starts with it's `function*` declaration (please not the `asterisk`) and the `yield` through which a generator can pause it's execution.

```js
function* generator() {
    // A
    yield 'foo'
    // B
}
```

When calling our `generator` function a new generator gets created that we can use to control the process through `.next()` function.

On `.next()` our generator's code gets executed until a `yield` expression is reached. At this point the value on `yield` is emitted by the iterator and the function execution is suspended.

```js
const g = generator()

g.next() // { value: 'foo', done: false }
// Our generator's code A gets executed
// and our value 'foo' gets emitted through yield.
// After this, our execution gets suspended.

g.next() // { value: undefined, done: true }
// At this stage the remaining code (i.e. B) gets executed.
// Because no value is emitted we get 'undefined' as the value,
// and the iterator returns 'true' for iteration done.
```

### yield

`yield` was born with generators and allow us to emit values. However, we can only do this while we are inside a generator.

If we try to `yield` a value on callback, for instance, even if declared inside the generator, we will get an error.

```js
function* generator() {
    ['foo','bar'].forEach(e => yield e) // SyntaxError
    // We can't use 'yield' inside non-generator functions.
}
```

#### `yield*`

`yield*` was built to enable calling a generator within a generator.

```js
function* foo() {
    yield 'foo'
}

// How would we call the 'foo' generator inside the 'bar' generator?
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

Our `b` iterator, produced by `bar` generator, does not work as expected when calling `foo`. This is because, although the execution of `foo` produces an iterator, we do not iterate over it. That's why `ES6` brought the operator `yield*`.

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

Internally `yield*` goes over every element of the generator and `yield` it.

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

Generators are simple iterables, which means that they follow the `iterable` and `iterator` protocols.

* The `iterable` protocol says that an object should return a function iterator whose key is `Symbol.iterator`:

```js
const g = generator()

typeof g[Symbol.iterator] // function
```

* The `iterator` protocol says that the iterator should be an object pointing to the next element in the iteration by follow an object structure with a method called `next`:

```js
const iterator = g[Symbol.iterator]()

typeof iterator.next // function
```

Because generators are iterables then we can use a data consumer, e.g. `for-of`, to iterate over generators values.
```js
for (let e of iterator) {
    console.log(e)
    // 'foo'
}
```

### Return

We can add a `return` statement to our generator, however this will behave differently according to the way generators' data is iterated.

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

Performing the iteration by hand, using `.next()`, we get our returned value as the `value` of our iterator object. Also the `done` flag is set to true.

However, when using a defined data consumer such as `for-of` or `destructuring`, the returned value is ignored.

```js
for (let e of g) {
    console.log(e)
    // 'foo'
    // 'bar'
}

console.log([...g]) // [ 'foo', 'bar' ]
```

#### yield*

`yield*` allows us to call a generator inside a generator. It also allow us to store the value returned by the executed generator.

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

We can `throw` inside a generator and the `.next()` will propagate the exception. As soon as an exception is thrown then the iterator flow breaks and it's state would be set `done: true` indefinitely.

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

## Generators as Data Consumer

Besides generators being data producers, through `yield`, they also have the ability to consume data using `next()` as iterable.

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

There's some aspects to discuss here:
1. Generator Creation

```js
var g = generatorDataConsumer()
```

At this stage we are just creating our generator `g`. Our execution is stop at point `A`.

2. First `next()`

```js
g.next() // { value: undefined, done: false }
// Ready to consume!
```

On `next()` first execution our generator is executed until the first `yield` statement. At this point any value sent through `next()` would be ignored. This is because there's no `yield` statement until the first `yield` statement :trollface:

Our execution now suspended at `B` waiting for a value to be filled on `yield`.

3. Next `next()`

```js
g.next('foo') // { value: undefined, done: false }
// Got: foo
```

On the next executions of `next()` our generator will run all code until the next `yield`. In this case, it logs the value that is got through `yield`, finishes a cycle on `while`, and start a new one suspending again on `yield`.

## Use Cases

### Implement Iterables

Because generators are an iterable implementation, when executed we will get an iterable object. Each `yield` represents the value emitted on each iteration. These description allow us to use generator to create iterables.

The following generator represents an iterable that iterates over all even numbers until `max` value is reached. Because our generator returns an iterable then we can use `for-of` data consumer to iterate over the values.

It's useful to remember that `yield` pauses the generator's execution. On each iteration the generator resumes from it was paused.

```js
function* evenNumbersUntil(max) {
    for (let value = 0; value <= max; value+=2) {
        // When the value is even we want to 'yield' the value
        // as our next value in the iteration.
        if (value % 2 === 0) yield value;
    }
}

// We can now user for-of to iterate over the values.
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

We can use generators to better work with async code, such as `promises`. This use case it a good introduction to the new `async / await` introduced in ES8.

Next is an example of fetching a JSON file with promises as we know it. We will use [Jake Archibald](https://twitter.com/jaffathecake) example on  [developers.google.com](https://developers.google.com/web/fundamentals/getting-started/primers/promises).
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

Using [co library](https://github.com/tj/co) and a generator our code will look more like synchronous code.
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

This is schema, made by [Axel Rauschmayer](https://twitter.com/rauschma) on [Exploring ES6](http://exploringjs.com/es6/index.html), shows how generators relate with iterators.

![Generator Inheritance](http://exploringjs.com/es6/images/generators----generator_inheritance_150dpi.png)

`Generators` are an implementation of `iterables` and follow the iterable and iterator protocol. Therefore they can be used to build iterables.

The most amazing thing about generators is their ability to suspend their execution. For this `ES6` brings a new statement called `yield`.

However, calling a generator inside a generator is not as easy as executing the generator function. For that, `ES6` has `yield*`.

Generator are the next step to bring `async` development close to synchronous.

## Thanks to :beers:
* [Axel Rauschmayer](https://twitter.com/rauschma) on his [Exploring ES6 - Generators](http://exploringjs.com/es6/ch_generators.html)
* [Nicolás Bevacqua](https://twitter.com/nzgb) on his [PonyFoo - ES6 Generators in Depth](https://ponyfoo.com/articles/es6-generators-in-depth)
