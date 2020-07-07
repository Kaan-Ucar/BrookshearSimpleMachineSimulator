﻿import React from "react";
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
    private _editor = React.createRef<Editor>();
    private _toolBar = React.createRef<ToolBar>();

    constructor(props) {
        super(props);

        this._machine.onStop = () => this._toolBar.current.setRunning(false);
        this._machine.onProgramCounterChange = (pc) => this._cpu.current.setProgramCounter(pc);
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
                    onResetMemory={() => this._machine.resetMemory()}
                    onRun={() => this.handleRun()}
                    onPause={() => this._machine.stop()}
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
        if (!this._assembler.assemblyLines(this._editor.current.getAllTokens())) {
            this._toolBar.current.setError("BUILD FAILED", true);
            return;
        }

        this._machine.stop();
        this._machine.setMemory(this._assembler.getMachineCode());
        this._toolBar.current.setSuccess("BUILD SUCCESSFUL", true);
    }
}

document.body.style.margin = "0";
ReactDOM.render(<App />, document.getElementById('root'));