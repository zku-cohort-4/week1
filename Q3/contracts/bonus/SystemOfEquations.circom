pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
//include ""; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    signal multiplication[n][n];
    
    var addition[n];
    
    // A boolean value checker for each variable
    var equaltionOutput;

    // [bonus] insert your code here
    // Getting the value of X, Y, and Z
    for (var i=0; i < n; i++) {
        for (var j=0; j < n; j++) {
            multiplication[i][j] <-- A[i][j] * x[j];
        }
    }

    // Adding the Xs, Ys, and Zx. 
    for (var i=0; i < n; i++) {
        for (var j=0; j < n; j++) {
            addition[i] += multiplication[i][j]; 
        }
        equaltionOutput += addition[i] - b[i];
    }

    component isZero = IsZero();
    
    isZero.in <-- equaltionOutput;

    isZero.out ==> out;
}

component main {public [A, b]} = SystemOfEquations(3);

/* INPUT = {
    "x": ["15","17","19"],
    "A": [["1","1","1"],["1","2","3"],["2","1","1"]],
    "b": ["51", "106", "32"]
} */
