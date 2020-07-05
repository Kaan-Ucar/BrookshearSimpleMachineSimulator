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

    assemblyTokens(lines: BrookshearAssemblerToken[][]) {
        let filteredLines: BrookshearAssemblerToken[][] = [];

        for (let line of lines)
            filteredLines.push(BrookshearAssembler.removeTypes(line, 1, ["whitespace", "comment"]));

        const codeSize = this.defineLabels(filteredLines);

        if (codeSize < 0)
            return false;

        this._machineCode = new Uint8Array(codeSize);
        this._machineCodeIndex = 0;

        for (let i = 0; i < lines.length; ++i)
            if (!this.assemblyLine(i + 1, filteredLines[i]))
                return false;

        const haltInstruction = parseInt("0xC0");
        if (this._machineCode.length > 0 && this._machineCode[this._machineCode.length - 2] !== haltInstruction)
            this.warning(lines.length, 0, "No halt instruction at end of program");

        console.log("build successfull");
        return true;
    }

    defineLabels(lines: BrookshearAssemblerToken[][]) {
        let codeSize = 0;

        for (let i = 0; i < lines.length; ++i)
            for (let token of lines[i]) {
                if (token.getType(1) === "instruction")
                    codeSize += 2;
                else if (token.getType(1) === "label") {
                    if (token.value[token.value.length - 1] === ':')
                        token.value = token.value.slice(0, -1);
                    else if (lines[i].length === 1)
                        this.warning(i + 1, token.start + token.value.length, "label alone on a line without a colon might be in error");

                    if (this._labels[token.value] !== undefined) {
                        this.error(i + 1, token.start, "label '" + token.value + "' redefined");
                        return -1;
                    }

                    this._labels[token.value] = codeSize;
                }
            }

        return codeSize;
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

    private assemblyLine(row: number, tokens: BrookshearAssemblerToken[]) {
        if (tokens.length > 0) {
            const firstToken = tokens[0];

            switch (firstToken.getType(1)) {
                case "label":
                    if (tokens.length > 1) {
                        const secondToken = tokens[1];

                        if (secondToken.getType(1) == "instruction")
                            return this.assemblyInstructionLine(row, tokens.slice(1));

                        this.error(row, secondToken.start, "instruction expected, but found " + secondToken.getType(1) + ": " + secondToken.value);
                        return false;
                    }
                    
                    return true;

                case "instruction":
                    return this.assemblyInstructionLine(row, tokens);
                    
                default:
                    this.error(row, firstToken.start, "label or instruction expected at start of line, but found " + firstToken.getType(1) + ": " + firstToken.value);
                    return false;
            }
        }

        return true;
    }

    private assemblyInstructionLine(row: number, tokens: BrookshearAssemblerToken[]) {
        if (!this.evaluateUnknowns(row, tokens))
            return false;

        const instruction = tokens[0].value.toLowerCase();
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
                this.error(row, tokens[0].start, "Could not resolve instruction: " + instruction);
                return false;
        }

        return this.assemblyInstruction(row, opcode, operandDrafts, tokens);
    }

    private assemblyInstruction(row: number, opcode: number, operandDrafts: { offset, size }[], tokens: BrookshearAssemblerToken[]) {
        if (operandDrafts.length > 0 && (tokens.length - 1) !== ((2 * operandDrafts.length) - 1)) {
            this.error(row, tokens[0].start + tokens[0].value.length, "invalid combination of opcode and operands");
            return false;
        }

        let operandTokens: BrookshearAssemblerToken[] = [];
        let i = 1;
        while (i < tokens.length) {
            if (tokens[i].getType(1) === "operand") {
                operandTokens.push(tokens[i]);
            }
            else {
                this.error(row, tokens[i].start, "operand expected, but found " + tokens[i].getType(1) + ": " + tokens[i].value);
                return false;
            }

            ++i;
            if (i < tokens.length) {
                if (tokens[i].getType(1) !== "comma") {
                    this.error(row, tokens[i].start, "comma expected after operand, but found " + tokens[i].getType(1) + ": " + tokens[i].value);
                    return false;
                }

                ++i;
            }
        }
        console.log("opcode: " + opcode);

        let halfBytes = [opcode, 0, 0, 0];
        for (let i = 0; i < operandTokens.length; ++i) {
            const limit = 16 ** operandDrafts[i].size;
            let value = parseInt(operandTokens[i].value);

            if (value >= limit) {
                this.warning(row, operandTokens[i].start, "operand value exceeds bounds");
                value = value % limit;
            }

            for (let j = 0; j < operandDrafts[i].size; ++j)
                halfBytes[operandDrafts[i].offset + j] = value >>> ((operandDrafts[i].size - 1 - j) * 4);
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