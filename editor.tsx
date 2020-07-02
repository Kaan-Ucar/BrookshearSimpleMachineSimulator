import React from "react";
import Palette from "./palette";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-cobalt";
import AssemblyBrookshearMode from "./assemblyBrookshearMode";

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

        let tokens = [];
        for (let i = 0; i < rows; ++i)
            tokens.push(this._editor.current.editor.getSession().getTokens(i));

        return tokens;
    }
}

export default Editor;