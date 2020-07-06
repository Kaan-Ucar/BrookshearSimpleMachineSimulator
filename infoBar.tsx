import React from "react";
import Palette from "./palette";

class infoBar extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            progress: 0,
            message: "",
            messageColor: "",
            bold: false,
            icon: ""
        };
    }

    render() {
        const style = {
            position: "relative",
            flexGrow: 1,
            background: "none",
        } as React.CSSProperties;

        const progressStyle = {
            position: "absolute",
            height: "100%",
            width: "100%",
            clipPath: "inset(0 " + (100 - this.state.progress) + "% 0 0)",
            background: Palette.progress,
        } as React.CSSProperties;

        const messageStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            color: this.state.messageColor
        } as React.CSSProperties;

        const textStyle = {
            textAlign: "center",
            fontFamily: "arial",
            fontWeight: this.state.bold ? "bold" : "normal"
        } as React.CSSProperties;

        return (
            <div style={style}>
                <div
                    key="progress"
                    style={progressStyle}>
                </div>
                <div
                    key="message"
                    style={messageStyle}>
                    <i className="material-icons">{this.state.icon}</i>
                    <span style={textStyle}>{this.state.message}</span>
                </div>
            </div>
        );
    }

    setProgress(progress: number) {
        this.setState({ progress: progress });
    }

    setInfo(message: string, bold = false) {
        this.setState({
            message: message,
            messageColor: Palette.passive,
            bold: bold,
            icon: "info_outline"
        });
    }

    setError(message: string, bold = false) {
        this.setState({
            message: message,
            messageColor: Palette.error,
            bold: bold,
            icon: "error_outline"
        });
    }

    setSuccess(message: string, bold = false) {
        this.setState({
            message: message,
            messageColor: Palette.success,
            bold: bold,
            icon: "check"
        });
    }
}

export default infoBar;