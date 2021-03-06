import React from "react";
import MemoryCellPair from "./memoryCellPair";
import Palette from "../palette";

class Memory extends React.Component<any, any> {
    private _cellPairs = new Map<number, React.RefObject<any>>();

    constructor(props) {
        super(props);

        for (let i = 0; i < this.props.memory; i += 2)
            this._cellPairs[i] = React.createRef<any>();
    }

    render() {
        const style = {
            backgroundColor: Palette.memoryBackground,
            color: Palette.passive,
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
            gridTemplateRows: "repeat(auto-fill, minmax(30px, 1fr))",
            padding: "16px",
            overflow: "auto"
        } as React.CSSProperties;

        const cellPairs = [];

        for (let i = 0; i < this.props.memory; i += 2)
            cellPairs.push(
                <MemoryCellPair key={i}
                    ref={this._cellPairs[i]}
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

    setCell(address: number, value: number) {
        const cellPair = this._cellPairs[address - (address % 2)].current;
        if (address % 2 === 0)
            cellPair.setFirstCell(value);
        else
            cellPair.setSecondCell(value);
    }
}

export default Memory;