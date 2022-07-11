#!/bin/bash

cd contracts/bonus

mkdir SystemOfEquations

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling SystemOfEquations.circom..."

# compile circuit

circom SystemOfEquations.circom  --verbose --r1cs --wasm --sym -o SystemOfEquations
snarkjs r1cs info SystemOfEquations/SystemOfEquations.r1cs

# Calculate the witness
cd SystemOfEquations/SystemOfEquations_js
node generate_witness.js SystemOfEquations.wasm ../../../../input_bonus.json ../../../../witness_bonus.wtns 

# # Start a new zkey and make a contribution

cd ../../

snarkjs groth16 setup SystemOfEquations/SystemOfEquations.r1cs powersOfTau28_hez_final_10.ptau SystemOfEquations/circuit_0000.zkey
snarkjs zkey contribute SystemOfEquations/circuit_0000.zkey SystemOfEquations/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey SystemOfEquations/circuit_final.zkey SystemOfEquations/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier SystemOfEquations/circuit_final.zkey ../SystemOfEquationsVerifier.sol

cd ../..