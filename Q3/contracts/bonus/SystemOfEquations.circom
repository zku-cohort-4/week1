pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matSub.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom";

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // [15, 17, 19] this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here

    //Ax = b or Ax-b = 0
    
    //Multiply Ax
    component mult = matMul(1, n,n);
    mult.a <== [x];
    mult.b <== A;

    //subtract b from Ax
    component diff = matSub(1, n);
    diff.b <==  mult.out;
    diff.a <== [b];
    
    //diff.out should be an array of 0s
    //sum each element
    component sum = matElemSum(1,n);
    sum.a <== diff.out;

    //check that the sum is 0;
    
    component isEqual = IsEqual();
    isEqual.in[0] <== 0;
    isEqual.in[1] <== sum.out;

    //the sum is equal to zero, x represents solutions, otherwise it does not.
    out <== isEqual.out;
}

component main {public [A, b]} = SystemOfEquations(3);