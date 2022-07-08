const fs = require("fs");

function bumpSolidity(contractNames) {
  const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;
  const verifierRegex = /contract Verifier/;

  for (const contractName of contractNames) {
    console.log("Bump Solidity contract:", contractName);

    let content = fs.readFileSync(`./contracts/${contractName}.sol`, {
      encoding: "utf-8",
    });
    let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0");
    bumped = bumped.replace(verifierRegex, `contract ${contractName}`);

    fs.writeFileSync(`./contracts/${contractName}.sol`, bumped);
  }
}

function main() {
  const solidityContractsNames = [
    "HelloWorldVerifier",
    "Multiplier3-plonkVerifier",
    "Multiplier3Verifier",
  ];

  bumpSolidity(solidityContractsNames);

  return 0;
}

main();
