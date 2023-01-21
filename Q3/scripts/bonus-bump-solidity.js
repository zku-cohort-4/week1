const fs = require('fs');
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegex = /contract Verifier/;

//SystemOfEquations
let content = fs.readFileSync('./contracts/SystemOfEquationsVerifier.sol', {
  encoding: 'utf-8',
});
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract SystemOfEquationsVerifier');

fs.writeFileSync('./contracts/SystemOfEquationsVerifier.sol', bumped);

//LessThan10

let contentLessThan10 = fs.readFileSync('./contracts/LessThan10Verifier.sol', {
  encoding: 'utf-8',
});
let bumpedLessThan10 = contentLessThan10.replace(
  solidityRegex,
  'pragma solidity ^0.8.0'
);
bumpedLessThan10 = bumpedLessThan10.replace(
  verifierRegex,
  'contract LessThan10Verifier'
);

fs.writeFileSync('./contracts/LessThan10Verifier.sol', bumpedLessThan10);
