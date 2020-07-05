class BrookshearAssemblerToken {
    private _types: string[];
    public value: string;
    public start: number;
    public index: number;

    constructor(types: string[], value: string, start: number, index: number) {
        this._types = types;
        this.value = value;
        this.start = start;
        this.index = index;
    }

    getType(index: number) {
        if (index >= this._types.length)
            return "";

        return this._types[index];
    }

    setTypes(types: string[]) {
        this._types = types;
    }
}

export default BrookshearAssemblerToken;