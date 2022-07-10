const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegex = /contract Verifier/;

let content = fs.readFileSync("./contracts/HelloWorldVerifier.sol", { encoding: "utf-8" });
let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.4");
bump = bumped.replace(verifierRegex, "contract HelloWorldVerifier");

fs.writeFileSync("./contracts/HelloWorldVerifier.sol", bump);

// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment
let multiplier3 = fs.readFileSync("./contracts/Multiplier3Verifier.sol", { encoding: "utf-8" });
let bumpedMultiplier3 = multiplier3.replace(solidityRegex, "pragma solidity ^0.8.4");
bumpMultiplier3 = bumpedMultiplier3.replace(verifierRegex, "contract Multiplier3Verifier");

fs.writeFileSync("./contracts/Multiplier3Verifier.sol", bumpMultiplier3);

let multiplier3_plonk = fs.readFileSync("./contracts/Multiplier3PlonkVerifier.sol", {
  encoding: "utf-8",
});
let bumpedMultiplier3_plonk = multiplier3_plonk.replace(solidityRegex, "pragma solidity ^0.8.4");
bumpMultiplier3_plonk = bumpedMultiplier3_plonk.replace(
  verifierRegex,
  "contract Multiplier3Verifier"
);

fs.writeFileSync("./contracts/Multiplier3PlonkVerifier.sol", bumpMultiplier3_plonk);
