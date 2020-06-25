import React from "react";
import Radium from "radium";
import Cell from "./cell";
import Palette from "./palette";

class CPUCell extends React.Component<any, any> {
    private _cell = React.createRef<any>();

    render() {
        const style = {
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "arial",
            alignItems: "center",
            padding: "4px 16px",

            ":hover": {
                background: Palette.cpuHighlightBackground
            },

            ":focus": {
                color: Palette.focus
            }
        } as React.CSSProperties;

        return (
            <div style={style}>
                <label onClick={() => this._cell.current.focus()}>
                    {this.props.label}
                </label>
                <Cell ref={this._cell}
                    onChange={(value) => this.props.onChange(this.props.register, value)}
                />
            </div>
        );
    }

    setValue(value) {
        this._cell.current.setValue(value);
    }
}

export default Radium(CPUCell);