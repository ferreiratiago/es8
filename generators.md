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

...

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
for(let e of iterator) {
    console.log(e)
    // 'foo'
}
```

How do generators work

async flows

# Use Cases

## Implement Iterables
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

## Asynchronous Code

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
