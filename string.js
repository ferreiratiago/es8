// String.prototype.padStart
// It pads the current string with the provided string until it reaches the specified length.
'foo'.padStart(10)            // '       foo'
'foo'.padStart(10,'123')      // '1231231foo'
'foo'.padStart(5, '123')      // '12foo'
'foo'.padStart(3, '123')      // 'foo'
'foo'.padStart(0)             // 'foo'

'foo'.padStart(10, undefined) // '       foo'
'foo'.padStart(10, null)      // 'nullnulfoo'
'foo'.padStart(10, 0)         // '0000000foo'

// String.prototype.padEnd
'foo'.padEnd(10)            // 'foo       '
'foo'.padEnd(10,'123')      // 'foo1231231'
'foo'.padEnd(5, '123')      // 'foo12'
'foo'.padEnd(3, '123')      // 'foo'
'foo'.padEnd(0)             // 'foo'

'foo'.padEnd(10, undefined) // 'foo       '
'foo'.padEnd(10, null)      // 'foonullnul'
'foo'.padEnd(10, 0)         // 'foo0000000'
