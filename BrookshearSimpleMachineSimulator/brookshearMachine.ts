class BrookshearMachine {
    public onStop = () => { };
    public onProgramCounterChange = (pc: number) => { };
    public onRegisterChange = (register: number, value: number) => { };
    public onMemoryChange = (address: number, value: number) => { };
    public onProgressChange = (progress: number) => { };
    public onInfo = (message: string) => { };
    public onError = (message: string) => { };

    private _programCounter = 0;
    private _registers = new Uint8Array(16);
    private _memory = new Uint8Array(256);
    private _running = false;
    private _stepTime = 2000;
    private _progress = 0;

    resetCPU() {
        this.setProgramCounter(0);

        for (let i = 0; i < this._registers.length; ++i)
            this.setRegister(i, 0);
    }

    resetMemory() {
        for (let i = 0; i < this._memory.length; ++i)
            this.setMemoryCell(i, 0);
    }

    setStepTime(ms: number) {
        this._stepTime = ms;
    }

    setProgramCounter(pc: number) {
        this.setProgress(0);

        if (pc === this._programCounter)
            return;

        this._programCounter = pc;
        this.onProgramCounterChange(pc);
    }

    setRegister(register: number, value: number) {
        if (this._registers[register] === value)
            return;

        this._registers[register] = value;
        this.onRegisterChange(register, value);
    }

    setMemoryCell(address: number, value: number) {
        if (this._memory[address] === value)
            return;

        this._memory[address] = value;
        this.onMemoryChange(address, value);
    }

    setMemory(values: Uint8Array, from: number = 0) {
        const to = Math.min(this._memory.length, values.length);

        for (let i = 0; i < to; ++i)
            this.setMemoryCell(from + i, values[i]);
    }

    private setProgress(progress: number) {
        this._progress = Math.min(progress, 100);
        this.onProgressChange(this._progress);
    }

    async run() {
        if (this._running)
            return;

        this._running = true;

        do {
            await this.runStep(true);
        } while (this._running);
    }

    stop() {
        this._running = false;
        this.onStop();
    }

    private async waitProgress() {
        const RESOLUTION = 1000 / 60; // 60fps

        while (this._running) {
            await new Promise((resolve) => setTimeout(resolve, RESOLUTION));
            this.setProgress(this._progress + (RESOLUTION / this._stepTime * 100));

            if (this._progress >= 100)
                return true;
        }

        return false;
    }

    stepOver() {
        if (this._running)
            this._progress = 100;
        else
            this.runStep(false);
    }

    private async runStep(wait: boolean) {
        const opcode = this._memory[this._programCounter] >>> 4;
        const operandA = this._memory[this._programCounter] & 15;
        const operandBC = this._memory[this._programCounter + 1];
        const operandB = operandBC >>> 4;
        const operandC = operandBC & 15;
        const strA = operandA.toString(16).toUpperCase();
        const strBC = operandBC.toString(16).padStart(2, "0").toUpperCase();
        const strB = operandB.toString(16).toUpperCase();
        const strC = operandC.toString(16).toUpperCase();
        let message = "";
        let instruction = () => { };

        switch (opcode) {
            case 1: // Copy the content of memory cell BC to register A.
                message = "Copy the content of memory cell " + strBC + " to register " + strA + ".";
                instruction = () => { this.setRegister(operandA, this._memory[operandBC]); };
                break;

            case 2: // Copy the bit-string BC to register A.
                message = "Copy the bit-string " + strBC + " to register " + strA + ".";
                instruction = () => { this.setRegister(operandA, operandBC); };
                break;

            case 3: // Copy the content of register A to memory cell BC.
                message = "Copy the content of register " + strA + " to memory cell " + strBC + ".";
                instruction = () => { this.setMemoryCell(operandBC, this._registers[operandA]); };
                break;

            case 4: // Copy the content of register B to register C.
                message = "Copy the content of register " + strB + " to register " + strC + ".";
                instruction = () => { this.setRegister(operandC, this._registers[operandB]); };
                break;

            case 5: // Add the content of register B and register C, and put the result in register A. Data is interpreted as integers in two's-complement notation.
                message = "Add the content of register " + strB + " and register " + strC + " as integers, and put the result in register " + strA + ".";
                instruction = () => { this.setRegister(operandA, this._registers[operandB] + this._registers[operandC]); };
                break;

            case 6: // Add the content of register B and register C, and put the result in register A. Data is interpreted as floats in floating point notation.
                message = "Add the content of register " + strB + " and register " + strC + " as floats, and put the result in register " + strA + ".";
                instruction = () => { this.setRegister(operandA, this._registers[operandB] + this._registers[operandC]); };
                break;

            case 7: // Bitwise OR the content of register B and C, and put the result in register A.
                message = "Bitwise OR the content of register " + strB + " and " + strC + ", and put the result in register " + strA + "."
                instruction = () => { this.setRegister(operandA, this._registers[operandB] | this._registers[operandC]); };
                break;

            case 8: // Bitwise AND the content of register B and C, and put the result in register A.
                message = "Bitwise AND the content of register " + strB + " and " + strC + ", and put the result in register " + strA + ".";
                instruction = () => { this.setRegister(operandA, this._registers[operandB] & this._registers[operandC]); };
                break;

            case 9: // Bitwise XOR the content of register B and C, and put the result in register A.
                message = "Bitwise XOR the content of register " + strB + " and " + strC + ", and put the result in register " + strA + "."
                instruction = () => { this.setRegister(operandA, this._registers[operandB] ^ this._registers[operandC]); };
                break;

            case 10: // Rotate the content of register A cyclically right C steps.
                message = "Rotate the content of register " + strA + " cyclically right " + strC + " steps."
                instruction = () => { this.setRegister(operandA, (this._registers[operandA] >>> this._registers[operandC]) | (this._registers[operandA] << (8 - this._registers[operandC]))); };
                break;

            case 11: // Jump to instruction in memory cell BC if the content of register A equals the content of register 0.
                message = "Jump to instruction in memory cell " + strBC + " if the content of register " + strA + " equals the content of register 0."
                instruction = () => {
                    if (this._registers[operandA] === this._registers[0])
                        this._programCounter = operandBC - 2;
                };
                break;

            case 12: // Halt execution.
                this.onInfo("Halt execution.");
                this.stop();
                return;

            default: // Opcode not found. Halted.
                this.onError("Opcode not found. Halted.");
                this.stop();
                return;
        }

        this.onInfo(message);

        let canceled = false;
        if (wait)
            canceled = !await this.waitProgress();

        if (!canceled) {
            instruction();
            this.setProgramCounter(this._programCounter + 2);
        }
    }
}

export default BrookshearMachine;