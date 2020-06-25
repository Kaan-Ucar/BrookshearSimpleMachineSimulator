import React from "react";
import CPUCell from "./cpuCell";
import Palette from "./palette";

class CPU extends React.Component<any, any> {
    private _pc = React.createRef<any>();
    private _registers = [];

    constructor(props) {
        super(props);

        for (let i = 0; i < this.props.registers; ++i)
            this._registers.push(React.createRef<any>());
    }

    render() {
        const style = {
            backgroundColor: Palette.cpuBackground,
            color: Palette.cpu,
            paddingTop: "16px",
            minWidth: "200px",
            display: "flex",
            flexDirection: "column"
        } as React.CSSProperties;

        const hrStyle = {
            borderColor: Palette.cpu,
            width: "100%"
        } as React.CSSProperties;

        const registers = [];

        for (let i = 0; i < this.props.registers; ++i)
            registers.push(
                <CPUCell key={i}
                    ref={this._registers[i]}
                    register={i}
                    label={"Register " + i.toString(16).toUpperCase()}
                    onChange={this.props.onRegisterChange}
                />
            );

        return (
            <div style={style}>
                <CPUCell ref={this._pc}
                    register={-1}
                    label="Program Counter"
                    onChange={(register, value) => this.props.onProgramCounterChange(value)}
                />
                <hr style={hrStyle} />
                {registers}
            </div>
        );
    }

    setProgramCounter(value) {
        this._pc.current.setValue(value);
    }

    setRegister(register, value) {
        this._registers[register].current.setValue(value);
    }
}

export default CPU;