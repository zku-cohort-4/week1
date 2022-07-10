#!/bin/bash

# [assignment] create your own bash script to compile Multiplier3_plonk.circom using PLONK below

cd contracts/circuits

mkdir Multiplier3_plonk

echo "Compiling Multiplier3_plonk.circom..."

# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3_plonk
snarkjs r1cs info Multiplier3_plonk/Multiplier3.r1cs

# Start a new zkey and make a contribution

snarkjs plonk setup Multiplier3_plonk/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3_plonk/circuit_final.zkey
snarkjs zkey export verificationkey Multiplier3_plonk/circuit_final.zkey Multiplier3_plonk/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3_plonk/circuit_final.zkey ../Multiplier3Verifier_plonk.sol

cd ../..