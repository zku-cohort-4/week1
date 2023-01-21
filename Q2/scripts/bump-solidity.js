const fs = require('fs');
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment
const verifierRegex = /contract Verifier/;

['HelloWorld', 'Multiplier3Groth'].forEach((contract) => {
  let content = fs.readFileSync(`./contracts/${contract}Verifier.sol`, {
    encoding: 'utf-8',
  });
  let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
  bumped = bumped.replace(verifierRegex, `contract ${contract}Verifier`);

  fs.writeFileSync(`./contracts/${contract}Verifier.sol`, bumped);
});

const contract = 'Multiplier3Plonk';
const verifierPlonkRegex = /contract PlonkVerifier/;

let content = fs.readFileSync(`./contracts/${contract}Verifier.sol`, {
  encoding: 'utf-8',
});
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierPlonkRegex, `contract ${contract}Verifier`);

fs.writeFileSync(`./contracts/${contract}Verifier.sol`, bumped);
