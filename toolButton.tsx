import React from "react";
import Radium from "radium";
import Palette from "./palette";

class ToolButton extends React.Component<any, any> {
    render() {
        const style = {
            display: "flex",
            flexDirection: "column",
            color: Palette.toolBar,
            justifyContent: "center",
            alignItems: "center",
            padding: "8px",
            minWidth: "64px",
            background: "none",
            border: "none",
            cursor: "pointer",
            outline: "none",

            ":hover": {
                color: Palette.toolBarHighlight,
                background: Palette.toolBarHighlightBackground
            }
        } as React.CSSProperties;

        return (
            <button style={style}
                onClick={() => this.props.onClick()}
            >
                <i className="material-icons">{this.props.icon}</i>
                {this.props.label}
            </button>
        );
    }
}

export default Radium(ToolButton);