# ES8 (ECMAScript 2017)
* [Trailing Commas](#trailing-commas)
* [Object.values / Object.entries](#objectvalues--objectentries)
    * [Object.values](#objectvalues)
    * [Object.entries](#objectentries)
* [Object.getOwnPropertyDescriptors](#objectgetownpropertydescriptors)
* [String Padding](#string-padding)
* [async / await](#async--await-1)
     * [Await](#await)
     * [Classes](#classes)
     * [Multiple Promises](#multiple-promises)
     * [Await and Thenable](#await-and-thenable)

## Trailing Commas

`Trailing commas` allow us to **add a comma to the last parameter** on a function declaration and execution.

This is specially useful when declaring or calling a function by placing each parameter per line. Great for version control.

```js
// Function Declaration
function foo(
    a,
    b,
    c,  // <- comma
) {}

// Function Execution
foo(
    1,
    2,
    3,  // <- comma
)
```

## Object.values / Object.entries

### Object.values

`Object.values` returns all values of an object in the same order as the `for...in` loop.

```js
var obj =  {
    foo: 'Mr.Foo',
    bar: 'Mr.Bar'
}

Object.values(obj)  // [ 'Mr.Foo', 'Mr.Bar' ]
```

### Object.entries

`Object.entries` returns a pair **[key , value]** for each element in the object.

```js
Object.entries(obj) // [ [ 'foo', 'Mr.Foo' ], [ 'bar', 'Mr.Bar' ] ]
```

## Object.getOwnPropertyDescriptors

`Object.getOwnPropertyDescriptors` returns all object properties descriptors.

```js
console.log(Object.getOwnPropertyDescriptors(obj))
// { foo:
//    { value: 'Mr.Foo',
//      writable: true,
//      enumerable: true,
//      configurable: true },
//   bar:
//    { value: 'Mr.Bar',
//      writable: true,
//      enumerable: true,
//      configurable: true } }
```

## String Padding

`String padding` pads the current string with the provided string until it reaches the specified length.

```js
// String.prototype.padStart
'foo'.padStart(10)            // '       foo'
'foo'.padStart(10,'123')      // '1231231foo'
'foo'.padStart(10, undefined) // '       foo'

// String.prototype.padEnd
'foo'.padEnd(10)            // 'foo       '
'foo'.padEnd(10,'123')      // 'foo1231231'
'foo'.padEnd(10, undefined) // 'foo       '
```

## async / await

`async / await` is the new Javascript syntax to declare an `asynchronous function`.

An `async function` returns an `AsyncFunction` object.

```js
> Object.getPrototypeOf(async function (){})
AsyncFunction {}
```

Before exploring  `async / await` let's first go back to `Promises` and move step-by-step.

### Promises

Javascript `Promises` already allowed us to do asynchronous development.

By creating a `Promise` we are representing a value that will be available now, or in the future, or never.

A `Promise` state can be:
* **pending** - meaning that the `Promise` was neither resolved nor rejected. Represents a `Promise` initial state.
* **resolved** - meaning that the operation, wrapped by the `Promise`, completed successfully.
* **rejected** - meaning that the operation failed.

```js
var getRandomWithPromise = (error) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (error) {
                // When an error occurs we reject our promise.
                reject('some error'); return;
            }
            // We resolve our promise with a random number.
            resolve(Math.floor(Math.random() * 100));
        }, 200);
    });
}
```

Here's an example of how we can use our `getRandomWithPromise`.

```js
getRandomWithPromise()
    // The resolver function to run when the promise is resolved.
    .then((result) => {
        console.log(`Your random number is ${result}!`);
    })
    // The resolver function to run when the promise is rejected.
    .catch((error) => {
        console.log(`Ups! Something went wrong! Details: ${error}`);
    });
```

### Generators

`Generators` allows us to stop a function execution until something happens.

When building a `generator` we are able to control when a function execution should pause and recover.

Next we will build a `generator` that will allows us to do some asynchronous development.

```js
var getRandomWithGenerator = (generator, error) => {
    // We first instantiate the generator.
    var g = generator();
    // And move forward to stop on the first yield field.
    g.next();

    // This setTimeout simulates that something asynchronous is happening (e.g. an HTTP request).
    // Although our code is able to proceed, our generator is suspended.
    setTimeout(function () {
        // At this point our asynchronous action is done and we should be able to do something with the response.
        // If an error occurs we can throw it through the generator.
        if (error) {
            g.throw('some error'); return;
        }
        // If all is good, we want to play our generator by calling the .next() method with the response.
        g.next(Math.floor(Math.random() * 100));
    }, 200);
}
```

An example of use to our `getRandomWithGenerator` could be the following.

```js
getRandomWithGenerator(
    // This function represents the operations that we want to run as soon as our generator 'fulfills'.
    function* onFulfill() {
        try {
            // yield will have the generator's result.
            var result = yield;
            console.log(`Your random number is ${result}!`);
        } catch(error) {
            // Because the generator can throw we should wrap our code into a try / catch block.
            console.log(`Ups! Something went wrong! Details: ${error}`);
        }
    }
);
```

Using `generators` for asynchronous development makes our job really hard.
Also, the code becomes a bit unreadable.

We should use promises or the new `async / await` for this.

### async / await

`async / await` is finally here and we can use it to make our asynchronous lives easier :metal:

`async` is the keyword that specifies that a function is `asynchronous`.

`await` is the operator used to wait for a promise to be fulfilled.
It can only be used inside an `async function`.

```js
async function () {
    // await
}
```

Let's build an example following the same idea of getting a random number.


```js
const getRandomWithAsync = async () => {
    try {
        return await getRandomWithPromise();
    } catch(error) {
        return error;
    }
}
```

The first thing to notice is the keyword `async` which reveals our arrow function as an asynchronous function.

Our `await` operator takes the promise `getRandomWithPromise` and pauses the function execution until the promise has been fulfilled.

When fulfilled the promise can be:
* **resolved** - meaning that `await` will return the resolved value.
* **rejected** - meaning that `await` will thrown the rejected value.

Because a promise can thrown an error it is important to wrap our code with a `try / catch` block.

Please note that the body of the function reads as an almost synchronous function.
There's no longer the need for indentation as with promise chain.

Here's an example of use.

```js
// An async function returns a promise, therefore it can be used with promise chain.
getRandomWithAsync()
    .then((result) => {
        console.log(`Your random number is ${result}!`);
    })
    .catch((error) => {
        console.log(`Ups! Something went wrong! Details: ${error}`);
    });
```

#### await

Unfortunately `await` can only be used inside an `async function`.
```js
var random = await getRandomWithAsync(); // Syntax Error.
```

In order to use `await` as described in the line above we need to wrap it around an `async IIFE`.
```js
(async function () {
    console.log(`Your random number is ${await getRandomWithAsync()}!`);
})();
```

#### Classes

We can also create `async functions` inside `classes`.
```js
class Random {
    async getRandom () {
        return await getRandomWithPromise();
    }
}

(async function () {
    var random = new Random();
    console.log(`Your random number is ${await random.getRandom()}!`)
})();
```

#### Multiple Promises

It will happen the case where we need to wait for multiple promises to fulfill.

We can do it in two ways - `sequentially`  and `concurrently`.

##### Sequentially
```js
(async function () {
    // Wait for the first promise to be fulfilled.
    var a = await getRandomWithPromise();
    // Wait for the second promise to be fulfilled.
    var b = await getRandomWithPromise();

    console.log(`Your random numbers are ${a} and ${b}!`);
})();
// [Execution Time] 0.490 ms total
```

This handling is complete sequential.

Our promise `b` is only executed after our promise `a` fulfills.

This is a major performance issue because we could have run both promises concurrently and take less time.

##### Concurrently
```js
(async function () {
    // Request the random numbers and save the promises.
    var aPromise = getRandomWithPromise();
    var bPromise = getRandomWithPromise();

    // At this point, the requests were both executed concurrently, meaning
    // that we didn't wait for the first to finish to request for the second.
    // We now just need to wait for both promises to be fulfill.
    var a = await aPromise;
    var b = await bPromise;

    // The function execution time would be equal to the promise that takes the most time.
    console.log(`Your random numbers are ${a} and ${b}!`);
})();
// [Execution Time] 0.283 ms total
```

##### Concurrently (with `Promise.all`)
One of the advantages with `Promise.all` is that it has the fail-fast behaviour.

If a promise fails, `Promise.all` will not wait for the other promises to be fulfill. It rejects immediately.

```js
(async function () {
    var [a,b] = await Promise.all([
        getRandomWithPromise(),
        getRandomWithPromise()
    ]);

    console.log(`Your random numbers are ${a} and ${b}!`);
})();
```

#### await and thenable
The use of the `await` operator is not restricted to promises.

```js
(async function () {
    var random = await 3;
    // await will convert any non-promise value into a promise value, meaning that
    // await will wrap the followed expression into 'Promise.resolve'.
    console.log(random); // 3
})();
```

`await` can be used with any object with a `.then()` method (i.e. a thenable).

```js
var thenable = {
    then(resolve) {
        resolve(45);
    }
};

(async function () {
    // Because await wraps the followed expression into 'Promise.resolve'
    // it will work with any thenable object (i.e. an object with a .then() method).
    var random = await thenable;

    console.log(random); // 45
})();
```
### Further Reading
* [Stage 3 Draft - Async Functions](https://tc39.github.io/ecmascript-asyncawait/)
* [MDN - async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
* [PonyFoo - Understanding JavaScript’s async await](https://ponyfoo.com/articles/understanding-javascript-async-await)

## Thanks to :beers:
* [Nicolás Bevacqua](https://twitter.com/nzgb) for this [PonyFoo - Understanding JavaScript’s async await] (https://ponyfoo.com/articles/understanding-javascript-async-await)
* MDN documentation
    * [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
    * [Exponentiation Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators)
