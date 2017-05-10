// Trailing Commas

// Function Declaration
// (without trailing comma)
function foo(
    a,
    b,
    c
) {}

// (with trailing comma)
function foo(
    a,
    b,
    c,  // Please notice the comma on the last argument.
) {}


// Function Execution
// (without trailing comma)
foo(
    1,
    2,
    3
)

// (with trailing comma)
foo(
    1,
    2,
    3,  // Please notice the comma on the last argument.
)

// Why?
// It happens the case where we need to declare or call a function by placing
// each paramter per line. This is specially usefull when there's a lot of
// parameters and for version control.
