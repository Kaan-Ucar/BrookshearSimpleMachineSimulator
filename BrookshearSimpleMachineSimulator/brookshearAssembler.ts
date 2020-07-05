import BrookshearAssemblerToken from "./brookshearAssemblerToken";

class BrookshearAssembler {
    public onWarning = (row, column, message) => { console.log("warning(" + row + "," + column + "): " + message); }
    public onError = (row, column, message) => { console.log("error(" + row + "," + column + "): " + message); }
    private _labels = {};
    private _machineCode = new Uint8Array();
    private _machineCodeIndex = 0;

    private warning(row: number, column: number, message: string) {
        this.onWarning(row, column, message);
    }

    private error(row: number, column: number, message: string) {
        this.onError(row, column, message);
    }

    getMachineCode() {
        return new Uint8Array(this._machineCode);
    }

    assemblyLines(lines: BrookshearAssemblerToken[][]) {
        let filteredLines: BrookshearAssemblerToken[][] = [];

        for (let line of lines)
            filteredLines.push(BrookshearAssembler.removeTypes(line, 1, ["whitespace", "comment"]));

        if (!this.controlLines(filteredLines))
            return false;

        for (let i = 0; i < filteredLines.length; ++i)
            filteredLines[i] = BrookshearAssembler.removeTypes(filteredLines[i], 1, ["label"]);

        for (let i = 0; i < filteredLines.length; ++i)
            if (!this.assemblyInstructionLine(i + 1, filteredLines[i]))
                return false;

        const haltInstruction = parseInt("0xC0");
        if (this._machineCode.length > 0 && this._machineCode[this._machineCode.length - 2] !== haltInstruction)
            this.warning(lines.length, 0, "No halt instruction at end of program");

        console.log("build successfull");
        return true;
    }

    private controlLines(lines: BrookshearAssemblerToken[][]) {
        let codeSize = 0;

        for (let i = 0; i < lines.length; ++i)
            if (lines[i].length > 0) {
                const firstToken = lines[i][0];

                if (firstToken.getType(1) === "instruction") {
                    codeSize += 2;
                }
                else if (firstToken.getType(1) === "label") {
                    if (firstToken.value[firstToken.value.length - 1] === ':')
                        firstToken.value = firstToken.value.slice(0, -1);
                    else if (lines[i].length === 1)
                        this.warning(i + 1, firstToken.start + firstToken.value.length, "label alone on a line without a colon might be in error");

                    if (this._labels[firstToken.value] !== undefined) {
                        this.error(i + 1, firstToken.start, "label '" + firstToken.value + "' redefined");
                        return false;
                    }

                    if (lines[i].length > 1) {
                        const secondToken = lines[i][1];

                        if (secondToken.getType(1) === "instruction") {
                            codeSize += 2;
                        }
                        else {
                            this.error(i + 1, secondToken.start, "instruction expected, but found " + secondToken.getType(1) + ": " + secondToken.value);
                            return false;
                        }
                    }
                    this._labels[firstToken.value] = codeSize;
                }
                else {
                    this.error(i + 1, firstToken.start, "label or instruction expected at start of line, but found " + firstToken.getType(1) + ": " + firstToken.value);
                    return false;
                }

            }

        this._machineCode = new Uint8Array(codeSize);
        this._machineCodeIndex = 0;

        return true;
    }

    clear() {
        this._labels = {};
        this._machineCode = new Uint8Array();
        this._machineCodeIndex = 0;
    }

    private static removeTypes(tokens: BrookshearAssemblerToken[], typeIndex: number, types: string[]) {
        let filteredTokens: BrookshearAssemblerToken[] = [];

        for (let token of tokens) {
            let push = true;

            for (let i = 0; push && i < types.length; ++i)
                if (token.getType(typeIndex) === types[i])
                    push = false;

            if (push)
                filteredTokens.push(token);
        }

        return filteredTokens;
    }

    private assemblyInstructionLine(row: number, line: BrookshearAssemblerToken[]) {
        if (line.length === 0)
            return true;

        if (!this.evaluateUnknowns(row, line))
            return false;

        const instruction = line[0].value.toLowerCase();
        let opcode = 0;
        let operandDrafts: { offset, size }[];

        switch (instruction) {
            case "ldr":
                opcode = 1;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 2 }];
                break;

            case "ldrc":
                opcode = 2;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 2 }];
                break;

            case "str":
                opcode = 3;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 2 }];
                break;

            case "mov":
                opcode = 4;
                operandDrafts = [{ offset: 2, size: 1 }, { offset: 3, size: 1 }];
                break;

            case "add":
                opcode = 5;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 1 }, { offset: 3, size: 1 }];
                break;

            case "fadd":
                opcode = 6;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 1 }, { offset: 3, size: 1 }];
                break;

            case "or":
                opcode = 7;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 1 }, { offset: 3, size: 1 }];
                break;

            case "and":
                opcode = 8;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 1 }, { offset: 3, size: 1 }];
                break;

            case "xor":
                opcode = 9;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 1 }, { offset: 3, size: 1 }];
                break;

            case "ror":
                opcode = 10;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 3, size: 1 }];
                break;

            case "jmp":
                opcode = 11;
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 2 }];
                break;

            case "hlt":
                opcode = 12;
                operandDrafts = [];
                break;

            default:
                this.error(row, line[0].start, "Could not resolve instruction: " + instruction);
                return false;
        }

        if (operandDrafts.length > 0 && (line.length - 1) !== ((2 * operandDrafts.length) - 1)) {
            this.error(row, line[0].start + line[0].value.length, "invalid combination of opcode and operands");
            return false;
        }

        let operandTokens: BrookshearAssemblerToken[] = [];
        let i = 1;
        while (i < line.length) {
            if (line[i].getType(1) === "operand") {
                operandTokens.push(line[i]);
            }
            else {
                this.error(row, line[i].start, "operand expected, but found " + line[i].getType(1) + ": " + line[i].value);
                return false;
            }

            ++i;
            if (i < line.length) {
                if (line[i].getType(1) !== "comma") {
                    this.error(row, line[i].start, "comma expected after operand, but found " + line[i].getType(1) + ": " + line[i].value);
                    return false;
                }

                ++i;
            }
        }

        let halfBytes = [opcode, 0, 0, 0];
        for (let i = 0; i < operandTokens.length; ++i) {
            const limit = 16 ** operandDrafts[i].size;
            let value = parseInt(operandTokens[i].value);

            if (value >= limit) {
                this.warning(row, operandTokens[i].start, "operand value exceeds bounds");
                value = value % limit;
            }

            for (let j = 0; j < operandDrafts[i].size; ++j)
                halfBytes[operandDrafts[i].offset + j] = (value >>> ((operandDrafts[i].size - 1 - j) * 4)) & 15;
        }

        this._machineCode[this._machineCodeIndex++] = (halfBytes[0] << 4) + halfBytes[1];
        this._machineCode[this._machineCodeIndex++] = (halfBytes[2] << 4) + halfBytes[3];

        return true;
    }

    private evaluateUnknowns(row: number, tokens: BrookshearAssemblerToken[]) {
        for (let token of tokens) {
            if (token.getType(1) === "") {
                const value = this._labels[token.value];

                if (value === undefined) {
                    this.error(row, token.start, "symbol '" + token.value + "' undefined");
                    return false;
                }

                token.setTypes(["constant", "operand", "decimal"]);
                token.value = value;
            }
        }

        return true;
    }
}

export default BrookshearAssembler;