import React from "react";
import MemoryCellPair from "./memoryCellPair";
import Palette from "./palette";

class Memory extends React.Component<any, any> {
    private _cellPairs = [];

    constructor(props) {
        super(props);

        for (let i = 0; i < this.props.memory; i += 2)
            this._cellPairs.push(React.createRef<any>());
    }

    render() {
        const style = {
            backgroundColor: Palette.memoryBackground,
            color: Palette.memory,
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
            gridTemplateRows: "repeat(auto-fill, minmax(30px, 1fr))",
            padding: "16px",
        } as React.CSSProperties;

        const cellPairs = [];

        for (let i = 0; i < this.props.memory; i += 2)
            cellPairs.push(
                <MemoryCellPair key={i}
                    ref={this._cellPairs[Math.trunc(i / 2)]}
                    address={i}
                    onChange={this.props.onChange}
                />
            );

        return (
            <div style={style}>
                {cellPairs}
            </div>
        );
    }

    setCell(address, value) {
        const cellPair = this._cellPairs[Math.trunc(address / 2)].current;
        if (address % 2 === 0)
            cellPair.setFirstCell(value);
        else
            cellPair.setSecondCell(value);
    }
}

export default Memory;