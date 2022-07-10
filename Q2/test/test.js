const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16, plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () {
  // declaring variables
  this.timeout(100000000);
  let Verifier;
  let verifier;

  // deploy HelloVerifier
  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Circuit should multiply two numbers correctly", async function () {
    // instantiate HelloWorld circuit
    const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom");

    // input for constraint
    const INPUT = {
      a: 2,
      b: 3,
    };

    // generate witness from constraint input
    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

    // asset correctness of witness generated
    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(Fr.eq(Fr.e(witness[1]), Fr.e(6)));
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing
    // generate proof and public signal from constraint input, compiled circuit, and phase 2 final zkey
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "2", b: "3" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    console.log("2x3 =", publicSignals[0]);

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    // generate verifaction parameters for solidity contract verification
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

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
  beforeEach(async function () {
    //[assignment] insert your script here
    Multiplier3Verifier = await ethers.getContractFactory("Multiplier3Verifier");
    multiplier3Verifier = await Multiplier3Verifier.deploy();
    await multiplier3Verifier.deployed();
  });

  it("Circuit should multiply three numbers correctly", async function () {
    //[assignment] insert your script here
    const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom");

    const INPUT = {
      a: 2,
      b: 3,
      c: 4,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    // console.log(witness);

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

    console.log("2x3x4 =", publicSignals[0]);

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    expect(await multiplier3Verifier.verifyProof(a, b, c, Input)).to.be.true;
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
    expect(await multiplier3Verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  beforeEach(async function () {
    //[assignment] insert your script here
    Multiplier3PlonkVerifier = await ethers.getContractFactory("Multiplier3PlonkVerifier");
    multiplier3PlonkVerifier = await Multiplier3PlonkVerifier.deploy();
    await multiplier3PlonkVerifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "2", b: "3", c: "4" },
      "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
    );

    expect(await multiplier3PlonkVerifier.verifyProof(proof, [publicSignals[0]])).to.be.true;
  });

  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    expect(await multiplier3PlonkVerifier.verifyProof("0x00", [0])).to.be.false;
  });
});
