const { expect, assert } = require('chai');
const { ethers } = require('hardhat');
const { groth16, plonk } = require('snarkjs');

const wasm_tester = require('circom_tester').wasm;

const F1Field = require('ffjavascript').F1Field;
const Scalar = require('ffjavascript').Scalar;
exports.p = Scalar.fromString(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);
const Fr = new F1Field(exports.p);

describe('LessThan10', function () {
  this.timeout(100000000);
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory('LessThan10Verifier');
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it('Circuit should return 1 when the input is less than 10', async function () {
    const circuit = await wasm_tester('contracts/circuits/LessThan10.circom');

    const INPUT = { in: 2 };

    const witness = await circuit.calculateWitness(INPUT, true);
    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
  });

  it('Circuit should return 1 when the input is more than 10', async function () {
    const circuit = await wasm_tester('contracts/circuits/LessThan10.circom');

    const INPUT = { in: 11 };

    const witness = await circuit.calculateWitness(INPUT, true);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
  });

  it('Should return true for correct proof for a value less than 10', async function () {
    const { proof, publicSignals } = await groth16.fullProve(
      { in: '2' },
      'contracts/circuits/LessThan10/LessThan10_js/LessThan10.wasm',
      'contracts/circuits/LessThan10/circuit_final.zkey'
    );

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const argv = calldata
      .replace(/["[\]\s]/g, '')
      .split(',')
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    expect(parseInt(Input, 10)).to.eq(1);
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it('Should return true for correct proof for a value greater than 10', async function () {
    const { proof, publicSignals } = await groth16.fullProve(
      { in: '10' },
      'contracts/circuits/LessThan10/LessThan10_js/LessThan10.wasm',
      'contracts/circuits/LessThan10/circuit_final.zkey'
    );

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const argv = calldata
      .replace(/["[\]\s]/g, '')
      .split(',')
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    expect(parseInt(Input, 10)).to.eq(0);
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });

  it('Should return false for invalid proof', async function () {
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
