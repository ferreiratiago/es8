var obj =  {
    foo: 'Mr.Foo',
    bar: 'Mr.Bar'
}

// Object.values
// Returns all values of an object in the same order as for...in loop.
Object.values(obj)  // [ 'Mr.Foo', 'Mr.Bar' ]

// Object.entries
// Returns a pair [key , value] for each element in the object.
Object.entries(obj) // [ [ 'foo', 'Mr.Foo' ], [ 'bar', 'Mr.Bar' ] ]

// Object.getOwnPropertyDescriptors
// Returns all object properties descriptors.
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
