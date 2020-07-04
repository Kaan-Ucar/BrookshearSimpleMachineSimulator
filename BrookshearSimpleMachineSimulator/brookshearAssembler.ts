class BrookshearAssembler {
    public onWarning = (row, column, message) => { console.log("warning(" + row + "," + column + "): " + message); }
    public onError = (row, column, message) => { console.log("error(" + row + "," + column + "): " + message); }
    private _labels = new Set<string>();
    private _machineCode:number[] = [];

    private warning(row: number, column: number, message: string) {
        this.onWarning(row, column, message);
    }

    private error(row: number, column: number, message: string) {
        this.onError(row, column, message);
    }

    private static filterTokens(tokens: BrookshearAssemblerToken[]) {
        let filteredTokens: BrookshearAssemblerToken[] = [];

        for (let i = 0; i < tokens.length; ++i) {
            if (tokens[i].getType(0) === "comment")
                return filteredTokens;

            if (tokens[i].getType(1) !== "whitespace")
                filteredTokens.push(tokens[i]);
        }

        return filteredTokens;
    }

    assemblyTokens(lineTokens: BrookshearAssemblerToken[][]) {
        for (let i = 0; i < lineTokens.length; ++i)
            if (!this.assemblyLine(i + 1, lineTokens[i]))
                return false;

        return true;
    }

    defineLabel(label: string) {
        if (this._labels.has(label))
            return false;

        this._labels.add(this._machineCode.length.toString());
        return true;
    }

    clear() {
        this._labels.clear();
        this._machineCode = [];
    }

    private assemblyLine(row: number, tokens: BrookshearAssemblerToken[]) {
        const filteredTokens = BrookshearAssembler.filterTokens(tokens);
        return this.assemblyFilteredLine(row, filteredTokens);
    }

    private assemblyFilteredLine(row: number, tokens: BrookshearAssemblerToken[]) {
        if (tokens.length > 0) {
            const firstToken = tokens[0];

            switch (firstToken.getType(1)) {
                case "label":
                    if (firstToken.value[firstToken.value.length - 1] === ':')
                        firstToken.value = firstToken.value.slice(0, -1);
                    else if (tokens.length === 1)
                        this.warning(row, firstToken.start + firstToken.value.length, "label alone on a line without a colon might be in error");

                    if (!this.defineLabel(firstToken.value)) {
                        this.error(row, firstToken.start, "label '" + firstToken.value + "' redefined");
                        return false;
                    }

                    if (tokens.length > 1) {
                        const secondToken = tokens[1];

                        if (secondToken.getType(1) == "instruction")
                            return this.assemblyInstructionLine(row, tokens.slice(1));

                        this.error(row, secondToken.start, "instruction expected, but found " + secondToken.getType(1) + ": " + secondToken.value);
                        return true;
                    }
                    
                    return true;

                case "instruction":
                    return this.assemblyInstructionLine(row, tokens.slice(1));
                    
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
                operandDrafts = [{ offset: 1, size: 1 }, { offset: 2, size: 1 }, { offset: 3, size: 1 }];
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

    assemblyInstruction(row: number, opcode: number, operandDrafts: { offset, size }[], tokens: BrookshearAssemblerToken[]) {
        if ((tokens.length - 1) !== ((2 * operandDrafts.length) - 1)) {
            this.error(row, tokens[0].start + tokens[0].value.length, "invalid combination of opcode and operands");
            return false;
        }

        let operandTokens: BrookshearAssemblerToken[] = [];
        let i = 1;
        while (i < tokens.length) {
            if (tokens[i].getType(1) !== "operand") {
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

        let halfBytes = [opcode, 0, 0, 0];
        for (let i = 0; i < operandTokens.length; ++i) {
            const limit = 16 ** operandDrafts[i].size;
            let value = parseInt(operandTokens[i].value);

            if (value > limit) {
                this.warning(row, operandTokens[i].start, "operand value exceeds bounds");
                value = value % limit;
            }

            for (let j = 0; j < operandDrafts[i].size; ++j)
                halfBytes[operandDrafts[i].offset + j] = value >>> ((operandDrafts[i].size - 1 - j) * 4);
        }

        this._machineCode.push(halfBytes[0] << 4 + halfBytes[1]);
        this._machineCode.push(halfBytes[2] << 4 + halfBytes[3]);

        return true;
    }

    private evaluateUnknowns(row: number, tokens: BrookshearAssemblerToken[]) {
        for (let token of tokens) {
            if (token.getType(1) === "") {
                if (this._labels.has(token.value)) {
                    this.error(row, token.start, "symbol '" + token.value + "' undefined");
                    return false;
                }

                token.setTypes(["constant", "operand", "decimal"]);
                token.value = this._labels[token.value];
            }
        }

        return true;
    }
}

export default BrookshearAssembler;