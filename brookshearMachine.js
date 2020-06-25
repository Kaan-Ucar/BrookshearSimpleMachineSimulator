'use strict';

class BrookshearMachine {
    constructor() {
        const REGISTERS_LENGTH = 16;
        const MEMORY_LENGTH = 256;

        this._programCounter = 0;
        this._registers = new Uint8Array(REGISTERS_LENGTH);
        this._memory = new Uint8Array(MEMORY_LENGTH);
        this._running = false;
        this._stepInterval = 2000;

        this.onStop = () => { };
        this.onProgramCounterChange = (pc) => { };
        this.onRegisterChange = (register, value) => { };
        this.onMemoryChange = (address, value) => { };
    }

    resetCPU() {
        this.setProgramCounter(0);

        for (let i = 0; i < this._registers.length; ++i)
            this.setRegister(i, 0);
    }

    setStepInterval(ms) {
        this._stepInterval = ms;
    }

    setProgramCounter(pc) {
        if (pc === this._programCounter)
            return;

        this._programCounter = pc;
        this.onProgramCounterChange(pc);
    }

    setRegister(register, value) {
        if (this._registers[register] === value)
            return;

        this._registers[register] = value;
        this.onRegisterChange(register, value);
    }

    setMemoryCell(address, value) {
        if (this._memory[address] === value)
            return;

        this._memory[address] = value;
        this.onMemoryChange(address, value);
    }

    run() {
        this._running = true;

        do {
            this.stepOver();
        } while (this._running);
    }

    async asyncRun() {
        this._running = true;

        this.stepOver();
        while (this._running) {
            await new Promise(resolve => setTimeout(resolve, this._stepInterval));

            if (this._running)
                this.stepOver();
        } 
    }

    stop() {
        this._running = false;
        this.onStop();
    }

    stepOver() {
        const opcode = this._memory[this._programCounter] >>> 4;
        const operandA = this._memory[this._programCounter] & 15;
        const operandBC = this._memory[this._programCounter + 1];
        const operandB = operandBC >>> 4;
        const operandC = operandBC & 15;

        switch (opcode) {
            case 1: // Copy the content of memory cell BC to register A.
                this.setRegister(operandA, this._memory[operandBC]);
                break;
            case 2: // Copy the bit-string BC to register A.
                this.setRegister(operandA, operandBC);
                break;
            case 3: // Copy the content of register A to memory cell BC.
                this.setMemoryCell(operandBC, this._registers[operandA])
                break;
            case 4: // Copy the content of register B to register C.
                this.setRegister(operandC, this._registers[operandB]);
                break;
            case 5: // Add the content of register B and register C, and put the result in register A. Data is interpreted as integers in two's-complement notation.
                this.setRegister(operandA, this._registers[operandB] + this._registers[operandC]);
                break;
            case 6: // Add the content of register B and register C, and put the result in register A. Data is interpreted as floats in floating point notation.
                //FLOAT
                this.setRegister(operandA, this._registers[operandB] + this._registers[operandC]);
                break;
            case 7: // Bitwise OR the content of register B and C, and put the result in register A.
                this.setRegister(operandA, this._registers[operandB] | this._registers[operandC]);
                break;
            case 8: // Bitwise AND the content of register B and C, and put the result in register A.
                this.setRegister(operandA, this._registers[operandB] & this._registers[operandC]);
                break;
            case 9: // Bitwise XOR the content of register B and C, and put the result in register A.
                this.setRegister(operandA, this._registers[operandB] ^ this._registers[operandC]);
                break;
            case 10: // Rotate the content of register A cyclically right C steps.
                this.setRegister(operandA, (this._registers[operandA] >>> this._registers[operandC]) | (this._registers[operandA] << (8 - this._registers[operandC])));
                break;
            case 11: // Jump to instruction in memory cell BC if the content of register A equals the content of register 0.
                if (this._registers[operandA] === this._registers[0])
                    this.setProgramCounter(operandBC - 2);
                break;
            case 12: // Halt execution.
                this.stop();
                return;
            case 13: // Jump to instruction in memory cell BC if the content of register A is greater than (>) the content of register 0. Data is interpreted as integers in two's-complement notation.
                if (this._registers[operandA] > this._registers[0])
                    this.setProgramCounter(operandBC - 2);

            default:
                this.stop();
                return;
        }

        this.setProgramCounter(this._programCounter + 2);
    }
}

export default BrookshearMachine;