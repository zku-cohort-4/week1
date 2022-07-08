pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/gates.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemMul.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    var sum[n];

    for (var i=0; i<n; i++) {
        sum[i] = 0;
    }

    component mul = matElemMul(n,n);

    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            mul.a[i][j] <== A[i][j];
            mul.b[i][j] <== x[j];
        }
    }

    component equals[n];

    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            sum[i] += mul.out[i][j];
        }
        equals[i] = IsEqual();
        equals[i].in[0] <== b[i];
        equals[i].in[1] <== sum[i];
    }

    component ands = MultiAND(n);

    for (var i=0; i<n; i++) {
        ands.in[i] <== equals[i].out;
    }

    out <== ands.out;
}

component main {public [A, b]} = SystemOfEquations(3);