import React from "react";
import Radium from "radium";
import Cell from "./cell";
import Palette from "./palette";

class CPUCell extends React.Component<any, any> {
    private _cell = React.createRef<any>();

    constructor(props) {
        super(props);

        this.state = { flashing: false };
    }

    render() {
        const style = {
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "arial",
            alignItems: "center",
            padding: "4px 16px",
            animationDuration: "1s",
            animationIterationCount: "1",
            animationTimingFunction: "ease-in",

            animationName: this.state.flashing ? Radium.keyframes({
                "from": { background: Palette.flash },
                "to": { background: "" }
            }) : "none",

            ":hover": {
                background: Palette.highlightBackground
            },

            ":focus": {
                color: Palette.focus
            }
        } as unknown as React.CSSProperties;

        return (
            <div
                style={style}
                onClick={() => this._cell.current.focus()}
            >
                <label>{this.props.label}</label>
                <Cell
                    ref={this._cell}
                    onChange={(value) => this.props.onChange(this.props.register, value)}
                />
            </div>
        );
    }

    setValue(value: number) {
        this._cell.current.setValue(value);

        if (!this.state.flashing && !this._cell.current.state.focused)
            this.setState({ flashing: true },
                () => setTimeout(() => this.setState({ flashing: false }), 1000));
    }
}

export default Radium(CPUCell);