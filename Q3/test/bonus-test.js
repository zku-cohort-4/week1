const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("SystemOfEquations circuit test", function () {
    this.timeout(100000000);

    it("Bonus question", async () => {
        const circuit = await wasm_tester("contracts/bonus/SystemOfEquations.circom");

        const INPUT = {
            "x": ["15","17","19"],
            "A": [["1","1","1"],["1","2","3"],["2",Fr.e(-1),"1"]],
            "b": ["51", "106", "32"]
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });
});

describe("SystemOfEquations verifier test", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("SystemOfEquationsVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({
            "x": ["15","17","19"],
            "A": [["1","1","1"],["1","2","3"],["2","-1","1"]],
            "b": ["51", "106", "32"]
        },
            "contracts/bonus/SystemOfEquations/SystemOfEquations_js/SystemOfEquations.wasm","contracts/bonus/SystemOfEquations/circuit_final.zkey");

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});