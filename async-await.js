// Promises
var getRandomWithPromise = (error) => {
    // Let's wrap our timeout into a Promise for async purposes.
    // (this timeout could be an HTTP request)
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

// Example of use.
getRandomWithPromise()
    // The resolver function to run when the promise is resolved.
    .then((result) => {
        console.log(`Your random number is ${result}!`);
    })
    // The resolver function to run when the promise is rejected.
    .catch((error) => {
        console.log(`Ups! Something went wrong! Details: ${error}`);
    });

// Generators
var getRandomWithGenerator = (generator, error) => {
    var g = generator();
    g.next();

    setTimeout(function () {
        if (error) {
            g.throw('some error'); return;
        }
        g.next(Math.floor(Math.random() * 100));
    }, 200);
}

// Example of use.
getRandomWithGenerator(function* onFulfill() {
    try {
        var result = yield;
        console.log(`Your random number is ${result}!`);
    } catch(error) {
        console.log(`Ups! Something went wrong! Details: ${error}`);
    }
});

// async / await
const getRandomWithAsync = async () => {
    try {
        // await can only be used inside an async functions.
        // await operator takes a promises and pauses the function execution until the promise has been fulfilled.
        // If the promise gets:
        // Rejected - await will throw the rejected value.
        // Resolved - await will return the resolved value.
        return await getRandomWithPromise();
    } catch(error) {
        return error;
    }
    // Please note:
    // The body of the function reads as an almost synchronous function.
    // There's no longer the need for indentation as with promise chain.
}

// Example of use.
// An async function returns a promise, therefore it can be used with promise chain.
getRandomWithAsync()
    .then((result) => {
        console.log(`Your random number is ${result}!`);
    })
    .catch((error) => {
        console.log(`Ups! Something went wrong! Details: ${error}`);
    });

// await
// Unfortunately await can only be used inside an async function, meaning that:
// var random = await getRandomWithAsync(); // Syntax Error.
// In order to use await as decribed in the line above we need to wrap it around an async IIFE.
(async function () {
    console.log(`Your random number is ${await getRandomWithAsync()}!`);
})();

// Class
// We can also create async functions inside classes.
class Random {
    async getRandom () {
        return await getRandomWithPromise();
    }
}

(async function () {
    var random = new Random();
    console.log(`Your random number is ${await random.getRandom()}!`)
})();

// Multiple Promises
// It will happen the case where we need to wait for multiple promises to fulfill.
// Sequentially
(async function () {
    // Wait for the first promise to be fulfilled.
    var a = await getRandomWithPromise();
    // Wait for the second promise to be fulfilled.
    var b = await getRandomWithPromise();

    // This handling is complete sequential.
    // Our second promise will only be executed after the first one being fulfill.
    // This is a major performance issue since we could have run both promises concurrently.
    console.log(`Your random numbers are ${a} and ${b}!`);
})();
// [Execution Time] 0.490 ms total

// Concurrently
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

// Concurrently (with Promise.all)
// One of the advantages with Promise.all is that it has the fail-fast behaviour,
// meaning if a promise fails it will not wait for the other promises to be fulfill but
// it rejects immediately.
(async function () {
    var [a,b] = await Promise.all([
        getRandomWithPromise(),
        getRandomWithPromise()
    ]);

    console.log(`Your random numbers are ${a} and ${b}!`);
})();

// await and thenable
// The use of the await operator is not restricted to Promises.
(async function () {
    var random = await 3;
    // await will convert any non-promise value into a promise value, meaning that
    // await will wrap the followed expression into 'Promise.resolve'.
    console.log(random); // 3
})();

// await can be used with any object with a .then() method (i.e. a thenable).
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
