import React from "react";
import ReactDOM from "react-dom";
import ToolBar from "./toolBar";
import CPU from "./cpu";
import Memory from "./memory";
import BrookshearMachine from "./brookshearMachine";

export class App extends React.Component<any, any> {
    private _machine = new BrookshearMachine();
    private _cpu = React.createRef<CPU>();
    private _memory = React.createRef<Memory>();

    constructor(props) {
        super(props);

        this.state = {
            running: false
        };

        this._machine.onStop = () => this.setState({ running: false });
        this._machine.onProgramCounterChange = (pc) => this._cpu.current.setProgramCounter(pc);
        this._machine.onRegisterChange = (register, value) => this._cpu.current.setRegister(register, value);
        this._machine.onMemoryChange = (address, value) => this._memory.current.setCell(address, value);
    }

    render() {
        const mainStyle = {
            minHeight: "calc(100vh - 55px)",
            width: "100%",
            marginTop: "55px",
            display: "flex",
            flexDirection: "row",
            alignContent: "stretch",
            alighItems: "stretch"
        } as React.CSSProperties;

        return (
            <React.Fragment>
                <ToolBar
                    running={this.state.running}
                    onResetCPU={() => this._machine.resetCPU()}
                    onRun={() => this.handleRun()}
                    onPause={() => this._machine.stop()}
                    onStepOver={() => this._machine.stepOver()}
                    onStepIntervalChange={(interval) => this._machine.setStepInterval(interval)}
                />
                <div style={mainStyle}>
                    <CPU ref={this._cpu}
                        registers={16}
                        onProgramCounterChange={(value) => this._machine.setProgramCounter(value)}
                        onRegisterChange={(register, value) => this._machine.setRegister(register, value)}
                    />
                    <Memory ref={this._memory}
                        memory={256}
                        onChange={(address, value) => this._machine.setMemoryCell(address, value)}
                    />
                </div>
            </React.Fragment>
        );
    }

    handleRun() {
        this.setState({ running: true });
        this._machine.asyncRun();
    }
}

document.body.style.margin = "0";
ReactDOM.render(<App />, document.getElementById('root'));