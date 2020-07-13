import React from "react";
import Radium from "radium"
import Palette from "../palette"

class Cell extends React.Component<any, any> {
    static formatText(text: string) {
        return text.replace(/[^0-9a-f]/gi, "").toUpperCase().padEnd(2, "0").slice(0, 2);
    }

    private _input = React.createRef<HTMLInputElement>();

    constructor(props) {
        super(props);

        this.state = {
            text: "00",
            focused: false
        };
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
            borderColor: Palette.passive,
            borderRadius: "4px",

            ":focus": {
                borderColor: Palette.focus
            }
        } as React.CSSProperties;

        return (
            <React.Fragment>
                <input
                    ref={this._input}
                    style={style}
                    value={this.state.text}
                    type="text"
                    spellCheck="false"
                    onChange={(event) => this.handleChange(event.target)}
                    onFocus={() => this.setState({ focused: true })}
                    onBlur={() => this.setState({ focused: false })}
                />
            </React.Fragment>
        );
    }

    private handleChange(input: EventTarget & HTMLInputElement) {
        this.setText(input.value, input.selectionEnd);
    }

    setValue(value: number) {
        this.setText(value.toString(16).padStart(2, "0"), this._input.current.selectionEnd);
    }

    setText(text: string, cursor: number) {
        const formattedText = Cell.formatText(text);

        this.setState(
            { text: formattedText },
            () => this._input.current.selectionStart = this._input.current.selectionEnd = cursor
        );

        this.props.onChange(parseInt(formattedText, 16));
    }

    focus() {
        if (!this.state.focused) {
            this._input.current.selectionStart = this._input.current.selectionEnd = 0;
            this._input.current.focus();
        }
    }
}

export default Radium(Cell);