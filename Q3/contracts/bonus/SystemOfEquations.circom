pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
// hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matMul.circom";
include "../../node_modules/circomlib-matrix/circuits/matSub.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template Sum(){
   signal input a;
   signal input b;
   signal output out;

   out <== a + b;
}

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    // this version didn't deal with negative number in the coefficient matrix

    component mul = matMul(n,n,1);
    component sub = matSub(n,1);
    component sum[n];
    component eq = IsEqual();

    for (var i=0; i<n; i++) {
        for (var j=0; j<n; j++) {
            mul.a[i][j] <== A[i][j];
        }

        mul.b[i][0] <== x[i];
    }

    for (var i=0; i<n; i++) {
        sub.a[i][0] <== mul.out[i][0];
        sub.b[i][0] <== b[i];
    }

    for (var i=0; i<n; i++) {
        sum[i] = Sum();
    }
    sum[0].a <== sub.out[0][0];
    sum[0].b <== 0;
    for (var i=0; i<n-1; i++) {
        sum[i+1].a <== sum[i].out;
        sum[i+1].b <== sub.out[i+1][0];
    }

    eq.in[0] <== sum[n-2].out;
    eq.in[1] <== 0;

    out <== eq.out;

}

component main {public [A, b]} = SystemOfEquations(3);