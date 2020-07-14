import React from "react";
import Radium from "radium";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-cobalt";
import AssemblyBrookshearMode from "../assemblyBrookshearMode";
import BrookshearAssemblerToken from "../brookshearAssemblerToken";
import Palette from "../palette";
import Terminal from "./terminal";

class Editor extends React.Component<any, any> {
    private _editor = React.createRef<AceEditor>();
    private _terminal = React.createRef<any>();

    componentDidMount() {
        this._editor.current.editor.getSession().setMode(new AssemblyBrookshearMode());
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
            flexGrow: 4
        } as React.CSSProperties;

        const fillStyle = {
            width: "100%",
            height: "100%"
        } as React.CSSProperties;

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
                </div>
                <Terminal
                    ref={this._terminal}
                    onToggle={() => this._editor.current.editor.resize()}
                />
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

    clearEditor() {
        this._editor.current.editor.getSession().setValue("");
    }

    clearTerminal() {
        this._terminal.current.clear();
    }

    appendWarningToTerminal(row, column, message) {
        this._terminal.current.appendWarning(row, column, message);
    }

    appendErrorToTerminal(row, column, message) {
        this._terminal.current.appendError(row, column, message);
    }

    appendMessageToTerminal(message: string, annotation = "") {
        this._terminal.current.appendMessage(message, annotation);
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

export default Editor;