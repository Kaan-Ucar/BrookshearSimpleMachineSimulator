import React from "react";
import Radium from "radium";
import ToolBar from "./toolBar";
import CPU from "./cpu";
import Memory from "./memory";
import BrookshearMachine from "../brookshearMachine";
import Editor from "./editor";
import BrookshearAssembler from "../brookshearAssembler";

class Root extends React.Component<any, any> {
    private _machine = new BrookshearMachine();
    private _assembler = new BrookshearAssembler();
    private _cpu = React.createRef<CPU>();
    private _memory = React.createRef<Memory>();
    private _editor = React.createRef<Editor>();
    private _toolBar = React.createRef<ToolBar>();
    private _rowMap = new Map<number, number>();

    constructor(props) {
        super(props);

        this._machine.onPause = () => this._toolBar.current.setRunning(false);
        this._machine.onProgramCounterChange = (pc) => this.handleProgramCounterChange(pc);
        this._machine.onRegisterChange = (register, value) => this._cpu.current.setRegister(register, value);
        this._machine.onMemoryChange = (address, value) => this.handleMemoryChange(address, value);
        this._machine.onProgressChange = (progress) => this._toolBar.current.setProgress(progress);
        this._machine.onInfo = (message) => this._toolBar.current.setInfo(message);
        this._machine.onError = (message) => this._toolBar.current.setError(message);

        this._assembler.onWarning = (row, column, message) => this._editor.current.appendWarningToTerminal(row, column, message);
        this._assembler.onError = (row, column, message) => this._editor.current.appendErrorToTerminal(row, column, message);
    }

    componentDidMount() {
        const fibonacciExample =
            "; Fibonacci Numbers \n" +
            "; sum will be in register F\n" +
            "ldrc 0x1, 10; n\n" +
            "ldrc 0xD, 0; previous\n" +
            "ldrc 0xE, 1; current\n" +
            "ldrc 0xF, 1; sum\n" +
            "ldrc 0xB, 1; i\n" +
            "\n" +
            "ldrc 0x0, 0\n" +
            "jmp 0x1, if; if (n == 0)\n" +
            "jmp 0x0, for_control\n" +
            "\n" +
            "if:\n" +
            "ldrc 0xF, 0; sum = 0\n" +
            "jmp 0x0, end; return\n" +
            "\n" +
            "for_control:\n" +
            "mov 0x1, 0x0\n" +
            "jmp 0xB, end; if (i == n) return\n" +
            "add 0xF, 0xD, 0xE; sum = previous + current\n" +
            "mov 0xE, 0xD; previous = current\n" +
            "mov 0xF, 0xE; current = sum\n" +
            "ldrc 0x0, 1\n" +
            "add 0xB, 0xB, 0x0; i = i + 1\n" +
            "jmp 0x0, for_control\n" +
            "\n" +
            "end:\n" +
            "hlt";

        this._editor.current.setText(fibonacciExample);
    }

    render() {
        const mainStyle = {
            height: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column"
        } as React.CSSProperties;

        const contentStyle = {
            display: "flex",
            flexGrow: 1,
            flexDirection: "row",
            alignContent: "stretch",
            alighItems: "stretch",
            overflowY: "auto"
        } as React.CSSProperties;

        return (
            <Radium.StyleRoot>
                <div style={mainStyle}>
                    <ToolBar ref={this._toolBar}
                        onResetCPU={() => this._machine.resetCPU()}
                        onResetMemory={() => this._machine.resetMemory()}
                        onRun={() => this.handleRun()}
                        onPause={() => this._machine.pause()}
                        onStepOver={() => this._machine.stepOver()}
                        onStepTimeChange={(ms) => this._machine.setStepTime(ms)}
                        onBuild={() => this.handleBuild()}
                        onClearEditor={() => this._editor.current.clearEditor()}
                    />
                    <div style={contentStyle}>
                        <CPU ref={this._cpu}
                            registers={16}
                            onProgramCounterChange={(value) => this._machine.setProgramCounter(value)}
                            onRegisterChange={(register, value) => this._machine.setRegister(register, value)}
                        />
                        <Memory ref={this._memory}
                            memory={256}
                            onChange={(address, value) => this._machine.setMemoryCell(address, value)}
                        />
                        <Editor ref={this._editor}
                            onChange={() => this.clearRowMap()}
                        />
                    </div>
                </div>
            </Radium.StyleRoot>
        );
    }

    private handleRun() {
        this._toolBar.current.setRunning(true);
        this._machine.run();
    }

    private handleBuild() {
        this._assembler.clear();
        this._editor.current.clearTerminal();
        this.clearRowMap();

        if (!this._assembler.assemblyLines(this._editor.current.getAllTokens())) {
            this._toolBar.current.setError("BUILD FAILED", true);
            this._editor.current.appendMessageToTerminal("Build failed.");
            return;
        }

        this._machine.stop();
        const machineCode = this._assembler.getMachineCode();
        this._machine.setMemory(machineCode);
        this._rowMap = this._assembler.getRowMap();
        this.handleProgramCounterChange(this._machine.getProgramCounter());
        this._toolBar.current.setSuccess("BUILD SUCCEEDED", true);
        this._editor.current.appendMessageToTerminal("Build succeeded: " + machineCode.length + "B.");
    }

    private handleProgramCounterChange(programCounter: number) {
        this._cpu.current.setProgramCounter(programCounter);

        if (this._rowMap.has(programCounter))
            this._editor.current.setArrowPosition(this._rowMap.get(programCounter));
        else
            this._editor.current.disappearArrow();
    }

    private handleMemoryChange(address, value) {
        this._memory.current.setCell(address, value);

        const key = address - (address % 2);
        if (this._rowMap.has(key)) {
            this._rowMap.delete(key);

            if (this._machine.getProgramCounter() === key)
                this._editor.current.disappearArrow();
        }
    }

    private clearRowMap() {
        this._rowMap.clear();
        this._editor.current.disappearArrow();
    }
}

export default Root;