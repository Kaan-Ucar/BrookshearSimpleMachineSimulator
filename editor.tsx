import React from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-cobalt";
import "ace-builds/src-noconflict/theme-terminal";
import AssemblyBrookshearMode from "./assemblyBrookshearMode";
import BrookshearAssemblerToken from "./brookshearAssemblerToken";

class Editor extends React.Component<any, any> {
    private _editor = React.createRef<AceEditor>();
    private _console = React.createRef<AceEditor>();
    
    componentDidMount() {
        this._editor.current.editor.getSession().setMode(new AssemblyBrookshearMode());
        this._console.current.editor.getSession().setOption("useWorker", false);
    }

    render() {
        const fibonacciExample =
            "; Fibonacci Numbers \n" +
            "; enter n in register 1\n" +
            "; sum will be in register F\n" +
            "; n = 0x1\n" +
            "ldrc 0xD, 0; prev\n" +
            "ldrc 0xE, 1; now\n" +
            "ldrc 0xF, 1; sum\n" +
            "ldrc 0xB, 1; i\n" +
            "\n" +
            "ldrc 0x0, 0\n" +
            "jmp 0x1, if ; if (n == 0)\n" +
            "jmp 0x0, for_control\n" +
            "\n" +
            "if:\n" +
            "ldrc 0xF, 0; sum = 0\n" +
            "jmp 0x0, end; return\n" +
            "\n" +
            "for_control:\n" +
            "mov 0x1, 0x0\n" +
            "jmp 0xB, end; if (i == n) return\n" +
            "add 0xF, 0xD, 0xE; sum = prev + now\n" +
            "mov 0xE, 0xD; prev = now\n" +
            "mov 0xF, 0xE; now = sum\n" +
            "ldrc 0x0, 1\n" +
            "add 0xB, 0xB, 0x0; i = i + 1\n" +
            "jmp 0x0, for_control\n" +
            "\n" +
            "end:\n" +
            "hlt";
        
        const style = {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            alignItems: "stretch",
            overflow: "auto"
        } as React.CSSProperties;
        
        const editorStyle = {
            flexGrow: 3
        } as React.CSSProperties;

        const consoleStyle = {
            flexGrow: 1,
            position: "relative"
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
                    <AceEditor
                        defaultValue={fibonacciExample}
                        ref={this._editor}
                        style={fillStyle}
                        theme="cobalt"
                        showPrintMargin={false}
                        wrapEnabled={true}
                    />
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

    clearEditor() {
        this._editor.current.editor.getSession().setValue("");
    }

    clearConsole() {
        this._console.current.editor.getSession().setValue("");
    }

    appendWarning(row, column, message) {
        let session = this._console.current.editor.getSession();
        const length = session.getLength();
        session.insert({ row: length, column: 0 }, "warning(" + row + "," + column + "): " + message + "\n");
        let annotations = session.getAnnotations();
        annotations.push({ row: length - 1, column: 20, text: message, type: "warning" });
        session.setAnnotations(annotations);
    }

    appendError(row, column, message) {
        let session = this._console.current.editor.getSession();
        const length = session.getLength();
        session.insert({ row: length, column: 0 }, "error(" + row + "," + column + "): " + message + "\n");
        let annotations = session.getAnnotations();
        annotations.push({ row: length - 1, column: 10, text: message, type: "error" });
        session.setAnnotations(annotations);
    }
}

export default Editor;