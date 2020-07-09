import React from "react";
import ReactDOM from "react-dom";
import ToolBar from "./toolBar";
import CPU from "./cpu";
import Memory from "./memory";
import BrookshearMachine from "./brookshearMachine";
import Editor from "./editor";
import BrookshearAssembler from "./brookshearAssembler";

export class App extends React.Component<any, any> {
    private _machine = new BrookshearMachine();
    private _assembler = new BrookshearAssembler();
    private _cpu = React.createRef<CPU>();
    private _memory = React.createRef<Memory>();
    private _editor = React.createRef<any>();
    private _toolBar = React.createRef<ToolBar>();
    private _rowMap = new Map<number, number>();
    
    constructor(props) {
        super(props);

        this._machine.onPause = () => this._toolBar.current.setRunning(false);
        this._machine.onProgramCounterChange = (pc) => this.handleProgramCounterChange(pc);
        this._machine.onRegisterChange = (register, value) => this._cpu.current.setRegister(register, value);
        this._machine.onMemoryChange = (address, value) => this._memory.current.setCell(address, value);
        this._machine.onProgressChange = (progress) => this._toolBar.current.setProgress(progress);
        this._machine.onInfo = (message) => this._toolBar.current.setInfo(message);
        this._machine.onError = (message) => this._toolBar.current.setError(message);

        this._assembler.onWarning = (row, column, message) => this._editor.current.appendWarning(row, column, message);
        this._assembler.onError = (row, column, message) => this._editor.current.appendError(row, column, message);
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
            <div style={mainStyle}>
                <ToolBar ref={this._toolBar}
                    onResetCPU={() => this._machine.resetCPU()}
                    onResetMemory={() => this.handleResetMemory()}
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
                    <Editor ref={this._editor} />
                </div>
            </div>
        );
    }

    private handleRun() {
        this._toolBar.current.setRunning(true);
        this._machine.run();
    }

    private handleBuild() {
        this._assembler.clear();
        this._editor.current.clearConsole();
        this._rowMap.clear();
        this._editor.current.disappearArrow();

        if (!this._assembler.assemblyLines(this._editor.current.getAllTokens())) {
            this._toolBar.current.setError("BUILD FAILED", true);
            this._editor.current.appendMessage("Build failed.");
            return;
        }

        this._machine.stop();
        const machineCode = this._assembler.getMachineCode();
        this._machine.setMemory(machineCode);
        this._rowMap = this._assembler.getRowMap();
        this.handleProgramCounterChange(this._machine.getProgramCounter());
        this._toolBar.current.setSuccess("BUILD SUCCEEDED", true);
        this._editor.current.appendMessage("Build succeded: " + machineCode.length + "B.");
    }

    private handleProgramCounterChange(programCounter: number) {
        this._cpu.current.setProgramCounter(programCounter);

        if (this._rowMap.has(programCounter))
            this._editor.current.setArrowPosition(this._rowMap.get(programCounter));
        else
            this._editor.current.disappearArrow();
    }

    private handleResetMemory() {
        this._machine.resetMemory();
        this._rowMap.clear();
        this._editor.current.disappearArrow();
    }
}

document.body.style.margin = "0";
ReactDOM.render(<App />, document.getElementById('root'));