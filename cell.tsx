import React from "react";
import Radium from "radium"
import Palette from "./palette"

class Cell extends React.Component<any, any> {
    static formatValue(value) {
        return value.replace(/[^0-9a-f]/gi, "").toUpperCase().padEnd(2, "0").slice(0, 2);
    }

    private _input = React.createRef<HTMLInputElement>();

    constructor(props) {
        super(props);

        this.state = { text: "00" };
    }

    render() {
        const style = {
            width: "2ch",
            fontFamily: "Lucida Console",
            fontSize: "medium",
            outline: "none",
            textAlign: "center",
            background: "none",
            color: Palette.default,
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: Palette.memory,
            borderRadius: "4px",

            ":focus": {
                borderColor: "#d31ac4"
            }
        } as React.CSSProperties;

        return (
            <input ref={this._input}
                style={style}
                value={this.state.text}
                type="text"
                //maxLength={2}
                onChange={(event) => this.handleChange(event.target)}
            />
        );
    }

    handleChange(input) {
        this.setText(input.value, input.selectionEnd);
    }

    setValue(value) {
        this.setText(value.toString(16).padStart(2, "0"), this._input.current.selectionEnd);
    }

    setText(text, cursor) {
        const formattedText = Cell.formatValue(text);

        this.setState(
            { text: formattedText },
            () => { this._input.current.selectionStart = this._input.current.selectionEnd = cursor; }
        );

        this.props.onChange(parseInt(formattedText, 16));
    }

    focus() {
        this._input.current.selectionStart = this._input.current.selectionEnd = 0;
        this._input.current.focus();
    }
}

export default Radium(Cell);