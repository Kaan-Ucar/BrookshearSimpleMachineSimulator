import React from "react";
import Radium from "radium";
import Cell from "./cell";
import Palette from "./palette";

class MemoryCellPair extends React.Component<any, any> {
    static toAddressLabel(address) {
        return address.toString(16).toUpperCase().padStart(2, "0");
    }

    private _firstCell = React.createRef<any>();
    private _secondCell = React.createRef<any>();

    render() {
        const style = {
            fontFamily: "Lucida Console",
            fontSize: "small",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            justifyContent: "center",
            alignItems: "center",
            margin: "auto"
        } as React.CSSProperties;

        const firstCellStyle = {
            padding: "4px",
            display: "inline-block",
            float: "right",

            ":focus": {
                color: Palette.focus
            },

            ":hover": {
                background: Palette.memoryHighlightBackground
            }
        } as React.CSSProperties;

        const secondCellStyle = {
            padding: "4px",
            display: "inline-block",
            float: "left",

            ":focus": {
                color: Palette.focus
            },

            ":hover": {
                background: Palette.memoryHighlightBackground
            }
        } as React.CSSProperties;

        const labelStyle = {
            margin: "auto",
            padding: "4px"
        } as React.CSSProperties;

        const firstAddress = this.props.address;
        const secondAddress = this.props.address + 1;
        const firstLabel = MemoryCellPair.toAddressLabel(firstAddress);
        const secondLabel = MemoryCellPair.toAddressLabel(secondAddress);

        return (
            <div style={style}>
                <div
                    key={0}
                    style={firstCellStyle}
                >
                    <label
                        style={labelStyle}
                        onClick={() => this._firstCell.current.focus()}
                    >
                        {firstLabel}
                    </label>
                    <Cell 
                        ref={this._firstCell}
                        onChange={(value) => this.props.onChange(firstAddress, value)}
                    />
                </div>
                <div
                    key={1}
                    style={secondCellStyle}
                >
                    <Cell 
                        ref={this._secondCell}
                        onChange={(value) => this.props.onChange(secondAddress, value)}
                    />
                    <label
                        style={labelStyle}
                        onClick={() => this._secondCell.current.focus()}
                    >
                        {secondLabel}
                    </label>
                </div>
            </div>
        );
    }

    setFirstCell(value) {
        this._firstCell.current.setValue(value);
    }

    setSecondCell(value) {
        this._secondCell.current.setValue(value);
    }
}

export default Radium(MemoryCellPair);