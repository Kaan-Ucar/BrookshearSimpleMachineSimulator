import React from "react";
import Radium from "radium";
import Palette from "./palette";

class Slider extends React.Component<any, any> {
    render() {
        const reverse = this.props.min > this.props.max;

        const style = {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            color: Palette.toolBar,
            background: "none",
            fontFamily: "arial",
            fontSize: "small",
            textAlign: "center",
            padding: "8px",
            direction: reverse ? "rtl" : "ltr",

            ":hover": {
                color: Palette.toolBarHighlight,
                background: Palette.toolBarHighlightBackground
            }
        } as React.CSSProperties;

        return (
            <div style={style}>
                <input
                    type="range"
                    min={reverse ? this.props.max : this.props.min}
                    max={reverse ? this.props.min : this.props.max}
                    defaultValue={this.props.defaultValue}
                    onChange={(event) => this.props.onChange(event.target.value)}
                />
                <label>{this.props.label}</label>
            </div>
        );
    }
}

export default Radium(Slider);