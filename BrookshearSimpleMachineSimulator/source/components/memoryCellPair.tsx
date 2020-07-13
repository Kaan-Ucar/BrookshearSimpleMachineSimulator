import React from "react";
import Radium from "radium";
import Cell from "./cell";
import Palette from "../palette";

class MemoryCellPair extends React.Component<any, any> {
    private _firstCell = React.createRef<any>();
    private _secondCell = React.createRef<any>();

    static toAddressLabel(address: number) {
        return address.toString(16).toUpperCase().padStart(2, "0");
    }

    constructor(props) {
        super(props);

        this.state = {
            firstFlashing: false,
            secondFlashing: false
        };
    }

    render() {
        const flashKeyframes = Radium.keyframes({
            "from": { background: Palette.flash },
            "to": { background: "" }
        });

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
            animationDuration: "1s",
            animationIterationCount: "1",
            animationTimingFunction: "ease-in",
            animationName: this.state.firstFlashing ? flashKeyframes : "none",

            ":focus": {
                color: Palette.focus
            },

            ":hover": {
                background: Palette.highlightBackground
            }
        } as unknown as React.CSSProperties;

        const secondCellStyle = {
            padding: "4px",
            display: "inline-block",
            float: "left",
            animationDuration: "1s",
            animationIterationCount: "1",
            animationTimingFunction: "ease-in",
            animationName: this.state.secondFlashing ? flashKeyframes : "none",

            ":focus": {
                color: Palette.focus
            },

            ":hover": {
                background: Palette.highlightBackground
            }
        } as unknown as React.CSSProperties;

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
                    onClick={() => this._firstCell.current.focus()}
                >
                    <label style={labelStyle}>{firstLabel}</label>
                    <Cell 
                        ref={this._firstCell}
                        onChange={(value) => this.props.onChange(firstAddress, value)}
                    />
                </div>
                <div
                    key={1}
                    style={secondCellStyle}
                    onClick={() => this._secondCell.current.focus()}
                >
                    <Cell 
                        ref={this._secondCell}
                        onChange={(value) => this.props.onChange(secondAddress, value)}
                    />
                    <label style={labelStyle}>{secondLabel}</label>
                </div>
            </div>
        );
    }

    setFirstCell(value: number) {
        this._firstCell.current.setValue(value);

        if (!this.state.firstFlashing && !this._firstCell.current.state.focused)
            this.setState({ firstFlashing: true },
                () => setTimeout(() => this.setState({ firstFlashing: false }), 1000));
    }

    setSecondCell(value: number) {
        this._secondCell.current.setValue(value);

        if (!this.state.secondFlashing && !this._secondCell.current.state.focused)
            this.setState({ secondFlashing: true },
                () => setTimeout(() => this.setState({ secondFlashing: false }), 1000));
    }
}

export default Radium(MemoryCellPair);