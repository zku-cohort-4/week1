const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("RangeProof", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("RangeProofVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        const { proof, publicSignals } = await groth16.fullProve({"in":"8","range":[5,10]}, "contracts/circuits/RangeProof/RangeProof_js/RangeProof.wasm","contracts/circuits/RangeProof/circuit_final.zkey");

        console.log('5 <= in <= 10:', publicSignals[0]);

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
        
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
});
