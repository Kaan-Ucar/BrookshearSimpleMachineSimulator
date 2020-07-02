export class AssemblyBrookshearHighlightRules extends window.ace.acequire("ace/mode/text_highlight_rules").TextHighlightRules {
    constructor() {
        super();

        this.$rules = {
            start:
                [
                    {
                        token: 'keyword.control.assembly',
                        regex: '\\b(?:shit|load|store|move|add|or|and|xor|rotate|jump|halt)\\b',
                        caseInsensitive: true
                    },
                    {
                        token: 'constant.character.decimal.assembly',
                        regex: '\\b[0-9]+\\b'
                    },
                    {
                        token: 'constant.character.hexadecimal.assembly',
                        regex: '\\b0x[A-F0-9]+\\b',
                        caseInsensitive: true
                    },
                    {
                        token: 'constant.character.hexadecimal.assembly',
                        regex: '\\b[A-F0-9]+h\\b',
                        caseInsensitive: true
                    },
                    {
                        token: 'entity.name.function.assembly',
                        regex: '^[\\w.]+?:'
                    },
                    {
                        token: 'comment.assembly',
                        regex: ';.*$'
                    },
                    {
                        token: 'punctuation.comma.assembly',
                        regex: ','
                    },
                    {
                        token: 'text.whitespace.assembly',
                        regex: '\\s+'
                    }
                ]
        };
    }
}

class AssemblyBrookshearMode extends window.ace.acequire("ace/mode/text").Mode {
    constructor() {
        super();
        this.HighlightRules = AssemblyBrookshearHighlightRules;
    }
}

export default AssemblyBrookshearMode;