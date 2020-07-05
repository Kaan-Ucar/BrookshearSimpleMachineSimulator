import React from "react";
import Palette from "./palette";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-cobalt";
import AssemblyBrookshearMode from "./assemblyBrookshearMode";
import BrookshearAssemblerToken from "./brookshearAssemblerToken";
import Ace from "ace-builds";
class Editor extends React.Component<any, any> {
    private _editor = React.createRef<AceEditor>();

    componentDidMount() {
        this._editor.current.editor.getSession().setMode(new AssemblyBrookshearMode());
    }

    render() {
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