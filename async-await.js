// Promises
var getRandom = (error) => {
    // Let's wrap our timeout into a Promise for async purposes.
    // (this timeout could be an HTTP request for instance)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (error) {
                // When an error occur we reject our promise.
                reject('some error'); return;
            }
            // We resolve our promise with a random number.
            resolve(Math.floor(Math.random() * 100));
        }, 200);
    });
}

// Example of use.
getRandom()
// The resolver function to run when the promise fulfills.
.then((result) => {
    console.log(`Your random number is ${result}!`);
})
// The resolver function to run when the promise is rejected.
.catch((error) => {
    console.log(`Ups! Something went wrong! Details: ${error}`);
});

// Generators
var getRandom = (generator, error) => {
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
getRandom(function* onFulfill() {
    try {
        var result = yield;
        console.log(`Your random number is ${result}!`);
    } catch(error) {
        console.log(`Ups! Something went wrong! Details: ${error}`);
    }
});

// async / await
async function random () {
    try {
        // await can only be used inside an async functions.
        // await operator takes a promises and pauses the function execution until the promise has been fulfilled.
        // If the promise gets:
        // Rejected - await will throw the rejected value.
        // Resolved - await will return the resolved value.
        return await getRandom();
    } catch(error) {
        return error;
    }
    // Please note:
    // The body of the function reads as an almost synchronous function.
    // There's no longer the need for identation as with promise chain.
}

// Example of use.
random().then(function (value) {
    console.log(value);
});
