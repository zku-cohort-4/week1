#!/bin/bash

cd contracts/circuits

mkdir Multiplier3_plonk

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_15.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_15.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau
fi

echo "Compiling Multiplier3.circom..."

# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3_plonk
snarkjs r1cs info Multiplier3_plonk/Multiplier3.r1cs

# Start a new zkey
echo "Generating zkey"
snarkjs plonk setup Multiplier3_plonk/Multiplier3.r1cs powersOfTau28_hez_final_15.ptau Multiplier3_plonk/circuit_final.zkey

echo "Exporting the verification key"

snarkjs zkey export verificationkey Multiplier3_plonk/circuit_final.zkey Multiplier3_plonk/verification_key.json

# # echo "Generating zk-proof"
# # snarkjs plonk prove Multiplier3_plonk/circuit_final.zkey Multiplier3_plonk/Multiplier3_js/generate_witness.js Multiplier3_plonk/proof.json Multiplier3_plonk/public.json

# # echo "Verify the proof"
# # snarkjs plonk verify  Multiplier3_plonk/verification_key.json  Multiplier3_plonk/public.json  Multiplier3_plonk/proof.json

# generate solidity contract
echo "Generating Solidity verifier"
snarkjs zkey export solidityverifier Multiplier3_plonk/circuit_final.zkey ../Multiplier3PlonkVerifier.sol

cd ../..
