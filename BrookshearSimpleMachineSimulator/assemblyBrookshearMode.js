export class AssemblyBrookshearHighlightRules extends window.ace.acequire("ace/mode/text_highlight_rules").TextHighlightRules { 
    constructor() {
        super();

        this.$rules = {
            start:
                [
                    {
                        token: 'keyword.instruction',
                        regex: '\\b(?:ldr|ldrc|str|mov|add|fadd|or|and|xor|ror|jmp|hlt)\\b',
                        caseInsensitive: true
                    },
                    {
                        token: 'constant.operand.decimal',
                        regex: '\\b[0-9]+\\b'
                    },
                    {
                        token: 'constant.operand.hexadecimal',
                        regex: '\\b0x[A-F0-9]+\\b',
                        caseInsensitive: true
                    },
                    {
                        token: 'constant.operand.hexadecimal',
                        regex: '\\b[A-F0-9]+h\\b',
                        caseInsensitive: true
                    },
                    {
                        token: 'entity.label',
                        regex: '^[\\w.]+?:'
                    },
                    {
                        token: 'entity.label',
                        regex: '^[\\w.]+?\\b'
                    },
                    {
                        token: 'comment.comment',
                        regex: ';.*$'
                    },
                    {
                        token: 'punctuation.comma',
                        regex: ','
                    },
                    {
                        token: 'text.whitespace',
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