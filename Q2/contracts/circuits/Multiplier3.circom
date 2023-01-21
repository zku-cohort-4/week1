pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;

   signal interum;
   signal output d;  

   // Constraints.  
   interum  <== a*b;
   d <== interum * c;  
}

component main = Multiplier3();