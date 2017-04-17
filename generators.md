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

use cases
* create iterator
* async code
