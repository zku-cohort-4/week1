pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals
template Multiplier2 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a * b;  
}

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;  

   // @ref https://docs.circom.io/more-circuits/more-basic-circuits/#extending-our-multiplier-to-three-inputs
   component mult1 = Multiplier2();
   component mult2 = Multiplier2();

   // Constraints.
   mult1.a <== a;
   mult1.b <== b;
   mult2.a <== mult1.c;
   mult2.b <== c;  
   d <== mult2.c;
}

component main = Multiplier3();
