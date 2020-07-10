import React from "react";
import Radium from "radium";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-cobalt";
import "ace-builds/src-noconflict/theme-terminal";
import AssemblyBrookshearMode from "./assemblyBrookshearMode";
import BrookshearAssemblerToken from "./brookshearAssemblerToken";
import Palette from "./palette";

class Editor extends React.Component<any, any> {
    private _editor = React.createRef<AceEditor>();
    private _console = React.createRef<AceEditor>();

    constructor(props) {
        super(props);

        this.state = {
            consoleVisible: false,
            notifications: 0
        };
    }

    componentDidMount() {
        this._editor.current.editor.getSession().setMode(new AssemblyBrookshearMode());
        this._console.current.editor.getSession().setOption("useWorker", false);
    }

    render() {
        const style = {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            alignItems: "stretch",
            overflow: "auto"
        } as React.CSSProperties;
        
        const editorStyle = {
            flexGrow: 4,
            position: "relative"
        } as React.CSSProperties;

        const consoleStyle = {
            flexGrow: this.state.consoleVisible ? 1 : 0,
            transition: "flex-grow 0.3s"
        } as React.CSSProperties;

        const fillStyle = {
            width: "100%",
            height: "100%"
        } as React.CSSProperties;

        const consoleButtonStyle = {
            position: "absolute",
            bottom: 0,
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

        const notificationsBubbleStyle = {
            position: "absolute",
            background: Palette.focus,
            color: Palette.default,
            borderRadius: "50%",
            left: "-8px",
            top: "-8px",
            width: "16px",
            height: "16px",
            visibility: this.state.notifications > 0 ? "visible": "hidden"
        } as React.CSSProperties;

        const notificationsTextStyle = {
            display: "inline-block",
            verticalAlign: "middle",
            fontSize: "small",
            fontFamily: "arial",
            textAlign: "center"
        } as React.CSSProperties;

        const consoleButtonIcon = this.state.consoleVisible ? "arrow_drop_down" : "arrow_drop_up";

        return (
            <div style={style}>
                <div
                    key="editor"
                    style={editorStyle}
                >
                    <Radium.Style
                        scopeSelector=".ace_gutter-cell.arrow"
                        rules={{
                            background: Palette.focus,
                            color: Palette.default,
                            clipPath: "polygon(73% 0, 100% 50%, 73% 100%, 0 100%, 0 0)"
                        }}
                    />
                    <AceEditor
                        ref={this._editor}
                        style={fillStyle}
                        theme="cobalt"
                        showPrintMargin={false}
                        wrapEnabled={true}
                        onChange={this.props.onChange}
                    />
                    <button
                        style={consoleButtonStyle}
                        onClick={() => this.toggleConsoleVisibility()}
                    >
                        <i className="material-icons">{consoleButtonIcon}</i>
                        <div style={notificationsBubbleStyle}>
                            <span style={notificationsTextStyle}>{ this.state.notifications }</span>
                        </div>
                    </button>
                </div>
                <div
                    key="console"
                    style={consoleStyle}
                >
                    <AceEditor
                        ref={this._console}
                        style={fillStyle}
                        theme="terminal"
                        showPrintMargin={false}
                        readOnly={true}
                        highlightActiveLine={false}
                        wrapEnabled={true}
                    />
                </div>
            </div>
        );
    }

    getAllTokens() {
        const rows = this._editor.current.editor.getSession().getLength();

        let tokens: BrookshearAssemblerToken[][] = [];
        
        for (let i = 0; i < rows; ++i) {
            const aceTokens = this._editor.current.editor.getSession().getTokens(i);
            let rowTokens: BrookshearAssemblerToken[] = [];

            let start = 0;
            for (let j = 0; j < aceTokens.length; ++j) {
                var types = aceTokens[j].type.split('.');
                var value = aceTokens[j].value;
                rowTokens.push(new BrookshearAssemblerToken(types, value.toString(), start, j));
                start += value.length;
            }

            tokens.push(rowTokens);
        }

        return tokens;
    }

    toggleConsoleVisibility() {
        this.setState({
            consoleVisible: !this.state.consoleVisible,
            notifications: !this.state.consoleVisible ? 0 : this.state.notifications
        });
        
        // resize on callback doesn't fix, resizing issue
        setTimeout(() => {
            this._console.current.editor.resize();
            this._editor.current.editor.resize();
        }, 300);
    }

    clearEditor() {
        this._editor.current.editor.getSession().setValue("");
    }

    clearConsole() {
        this._console.current.editor.getSession().setValue("");
        this.setState(() => ({ notifications: 0 }));
    }

    appendWarning(row, column, message) {
        this.appendMessage("warning(" + row + "," + column + "): " + message, "warning");
    }

    appendError(row, column, message) {
        this.appendMessage("error(" + row + "," + column + "): " + message, "error");
    }

    appendMessage(message: string, annotation = "") {
        let session = this._console.current.editor.getSession();
        const length = session.getLength();
        session.insert({ row: length, column: 0 }, message + "\n");
        
        if (annotation !== "") {
            let annotations = session.getAnnotations();
            annotations.push({ row: length - 1, column: 0, text: message, type: annotation });
            session.setAnnotations(annotations);
        }

        if (!this.state.consoleVisible)
            this.setState(prevState => ({ notifications: prevState.notifications + 1 }));
    }

    setArrowPosition(row: number) {
        this.disappearArrow();
        this._editor.current.editor.getSession().setBreakpoint(row, "arrow");
    }

    disappearArrow() {
        this._editor.current.editor.getSession().clearBreakpoints();
    }

    setText(text: string) {
        this._editor.current.editor.setValue(text, -1);
    }
}

export default Radium(Editor);