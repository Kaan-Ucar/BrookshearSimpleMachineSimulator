import React from "react";
import Palette from "./palette";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-cobalt";
import AssemblyBrookshearMode from "./assemblyBrookshearMode";
import BrookshearAssemblerToken from "./brookshearAssemblerToken";

class Editor extends React.Component<any, any> {
    private _editor = React.createRef<AceEditor>();

    componentDidMount() {
        this._editor.current.editor.getSession().setMode(new AssemblyBrookshearMode());
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
            flexGrow: 1
        } as React.CSSProperties;
        
        const editorStyle = {
            width: "100%",
            height: "100%"
        } as React.CSSProperties;
        
        return (
            <div style={style}>
                <AceEditor
                    defaultValue={fibonacciExample}
                    ref={this._editor}
                    style={editorStyle}
                    theme="cobalt"
                    showPrintMargin={false}
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
}

export default Editor;