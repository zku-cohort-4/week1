const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () {
  this.timeout(100000000);
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Circuit should multiply two numbers correctly", async function () {
    const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom");

    const INPUT = {
      a: 2,
      b: 3,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    console.log(witness);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(Fr.eq(Fr.e(witness[1]), Fr.e(6)));
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing
    // Creating the Groth16 proof and calculating the witness at the same time
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "2", b: "3" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    console.log("2x3 =", publicSignals[0]);

    // This function is for generating the solidity compatable params
    // for the `HelloWorldVerifier.sol` contract.
    // `calldata` are the proof params generated that will be used in order to
    // verify the proof using `HelloWorldVerifier.sol` contract.
    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    // Splitting the calldata
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    console.log("[HelloWorld argv]", argv);

    // Generating the pairing G1Point
    const a = [argv[0], argv[1]];
    // Generating the pairing G2Point
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    // Generating the pairing G1Point
    const c = [argv[6], argv[7]];
    // Cutting the last record in the argv to get the multiplication result
    const Input = argv.slice(8);

    console.log("[HelloWorld Input]", Input);

    // Expected to be true if the proof if valid
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  this.timeout(100000000);
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("Multiplier3Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Circuit should multiply three numbers correctly", async function () {
    const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom");

    const INPUT = {
      a: 2,
      b: 3,
      c: 4,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    console.log(witness);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(Fr.eq(Fr.e(witness[1]), Fr.e(24)));
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "2", b: "3", c: "4" },
      "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3/circuit_final.zkey"
    );

    console.log("[Multiplier3 Groth16 proof]: ", proof);
    console.log("[Multiplier3 Groth16 publicSignals]: ", publicSignals);
    console.log(
      "[Multiplier3 Groth16 publicSignals]: 2x3x4 = ",
      publicSignals[0]
    );

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    console.log("[Multiplier3 Groth16 calldata]:", calldata);

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    console.log("[Multiplier3 Groth16 argv]", argv);

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    console.log("[HelloWorld Input]", Input);

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  beforeEach(async function () {
    //[assignment] insert your script here
    Verifier = await ethers.getContractFactory("PlonkVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "2", b: "3", c: "4" },
      "contracts/circuits/Multiplier3-plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3-plonk/circuit_final.zkey"
    );

    // @ref: https://vivianblog.hashnode.dev/how-to-create-a-zero-knowledge-dapp-from-zero-to-production
    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    const calldataSplit = calldata.split(",");
    const [proof_after, ...rest] = calldataSplit;
    const publicSignals_after = JSON.parse(rest.join(",")).map((x) =>
      BigInt(x).toString()
    );

    expect(await verifier.verifyProof(proof_after, publicSignals_after)).to.be
      .true;
  });

  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let proof = 0x0;
    let pubSignals = [0x0];
    expect(await verifier.verifyProof(proof, pubSignals)).to.be.false;
  });
});
