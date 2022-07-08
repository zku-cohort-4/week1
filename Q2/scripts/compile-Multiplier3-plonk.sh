#!/bin/bash

# [assignment] create your own bash script to compile Multiplier3.circom using plonk below

cd contracts/circuits

mkdir Multiplier3-plonk

echo "Compiling Multiplier3-plonk.circom..."

# [assignment] create your own bash script to compile Multiplier3.circom modeling after compile-Multiplier3.sh below
circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3-plonk
snarkjs r1cs info Multiplier3-plonk/Multiplier3.r1cs

# Calculate the witness
cd Multiplier3-plonk/Multiplier3_js
node generate_witness.js Multiplier3.wasm ../../../../input.json ../../../../witness_plonk.wtns 

cd ../../

echo "Setup plonk schema..."
# Start a new zkey and make a contribution
snarkjs plonk setup Multiplier3-plonk/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3-plonk/circuit_final.zkey

#echo "Verify the final zkey"
#snarkjs zkey verify Multiplier3-plonk/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3-plonk/circuit_final.zkey

echo "Export the verification key"
snarkjs zkey export verificationkey Multiplier3-plonk/circuit_final.zkey verification_key_plonk.json

echo "Create the proof"
snarkjs plonk prove Multiplier3-plonk/circuit_final.zkey ../../witness.wtns ../../proof_plonk.json ../../public_plonk.json

echo "Verify the proof"
snarkjs plonk verify verification_key_plonk.json ../../public_plonk.json ../../proof_plonk.json

