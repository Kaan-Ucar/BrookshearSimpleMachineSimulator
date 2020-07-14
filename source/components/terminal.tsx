import React from "react";
import Radium from "radium";
import AceEditor from "react-ace";
import Palette from "../palette";
import "ace-builds/src-noconflict/theme-terminal";

class Terminal extends React.Component<any, any> {
    private _editor = React.createRef<AceEditor>();

    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            notifications: 0
        };
    }

    componentDidMount() {
        this._editor.current.editor.getSession().setOption("useWorker", false);
    }

    render() {
        const style = {
            flexGrow: this.state.expanded ? 1 : 0,
            transition: "flex-grow 0.3s",
            position: "relative"
        } as React.CSSProperties;

        const toggleButtonStyle = {
            position: "absolute",
            bottom: "100%",
            right: "20px",
            color: Palette.default,
            background: "black",
            border: "none",
            cursor: "pointer",
            outline: "none",
            borderTopLeftRadius: "25%",
            borderTopRightRadius: "25%",

            ":hover": {
                color: Palette.focus
            }
        } as React.CSSProperties;

        const fillStyle = {
            width: "100%",
            height: "100%"
        } as React.CSSProperties;

        const notificationsBubbleStyle = {
            position: "absolute",
            background: Palette.focus,
            color: Palette.default,
            borderRadius: "50%",
            left: "-8px",
            top: "-8px",
            width: "16px",
            height: "16px",
            visibility: this.state.notifications > 0 ? "visible" : "hidden"
        } as React.CSSProperties;

        const notificationsTextStyle = {
            display: "inline-block",
            verticalAlign: "middle",
            fontSize: "small",
            fontFamily: "arial",
            textAlign: "center"
        } as React.CSSProperties;

        const toggleButtonIcon = this.state.expanded ? "arrow_drop_down" : "arrow_drop_up";

        return (
            <div style={style}>
                <button
                    style={toggleButtonStyle}
                    onClick={() => this.toggleVisibility()}
                >
                    <i className="material-icons">{toggleButtonIcon}</i>
                    <div style={notificationsBubbleStyle}>
                        <span style={notificationsTextStyle}>{this.state.notifications}</span>
                    </div>
                </button>
                <AceEditor
                    ref={this._editor}
                    style={fillStyle}
                    theme="terminal"
                    showPrintMargin={false}
                    readOnly={true}
                    highlightActiveLine={false}
                    wrapEnabled={true}
                />
            </div>
        );
    }

    toggleVisibility() {
        this.setState({
            expanded: !this.state.expanded,
            notifications: !this.state.expanded ? 0 : this.state.notifications
        });

        // resize on callback doesn't fix, resizing issue
        setTimeout(() => {
            this.props.onToggle();
            this._editor.current.editor.resize();
        }, 300);
    }

    clear() {
        const session = this._editor.current.editor.getSession();
        session.clearAnnotations();
        session.setValue("");
        this.setState(() => ({ notifications: 0 }));
    }

    appendWarning(row, column, message) {
        this.appendMessage("warning(" + row + "," + column + "): " + message, "warning");
    }

    appendError(row, column, message) {
        this.appendMessage("error(" + row + "," + column + "): " + message, "error");
    }

    appendMessage(message: string, annotation = "") {
        let session = this._editor.current.editor.getSession();
        const length = session.getLength();
        session.insert({ row: length, column: 0 }, message + "\n");

        if (annotation !== "") {
            let annotations = session.getAnnotations();
            annotations.push({ row: length - 1, column: 0, text: message, type: annotation });
            session.setAnnotations(annotations);
        }

        if (!this.state.expanded)
            this.setState(prevState => ({ notifications: prevState.notifications + 1 }));
    }
}

export default Radium(Terminal);