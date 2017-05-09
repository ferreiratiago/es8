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
