/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

const ColorRulesDefault = [
    { token: 'undef', foreground: 'FF0000' },
    { token: 'comment', foreground: '008800' },

    { token: 'sfunc', foreground: 'FF909B' },
    { token: 'func', foreground: 'FF909B' },
    { token: 'instr', foreground: 'bf00ff', fontStyle: 'bold' },
    { token: 'macro', foreground: '7CFC00' },
    { token: 'macroIndicator', foreground: 'bf00ff' },
    { token: 'inc', foreground: '7CFC00' },
    { token: 'incPath', foreground: '87CEFA' },

    { token: 'degree', foreground: '00FFFF' },
    { token: 'pitOp-chord', foreground: '00BBFF' },
    { token: 'durOp-stac-volOp', foreground: '00FFBB' },
    { token: 'chordBracket', foreground: '00BBBB' },

    { token: '@bracket', foreground: 'fc8f00' },
    { token: 'volta', foreground: 'FFFF00' },
    { token: 'barline', foreground: 'fc8f00' },
    { token: 'repeat', foreground: 'FFFF00' },
    { token: 'press-release', foreground: 'fcde00' },
    { token: 'tie', foreground: 'fcde00' },
]

let ColorRules: any

window.onload = function () {
    (<any>window).require.config({ paths: { 'vs': 'vs' } });
    (<any>window).require(['vs/editor/editor.main'], function () {
        (<any>window).monaco = monaco
    });
    (<HTMLTextAreaElement>this.document.getElementById('color')).value = 
`[
    { "token": "undef", "foreground": "FF0000" },
    { "token": "comment", "foreground": "008800" },

    { "token": "sfunc", "foreground": "FF909B" },
    { "token": "func", "foreground": "FF909B" },
    { "token": "instr", "foreground": "bf00ff", "fontStyle": "bold" },
    { "token": "macro", "foreground": "7CFC00" },
    { "token": "macroIndicator", "foreground": "bf00ff" },
    { "token": "inc", "foreground": "7CFC00" },
    { "token": "incPath", "foreground": "87CEFA" },

    { "token": "degree", "foreground": "00FFFF" },
    { "token": "pitOp-chord", "foreground": "00BBFF" },
    { "token": "durOp-stac-volOp", "foreground": "00FFBB" },
    { "token": "chordBracket", "foreground": "00BBBB" },

    { "token": "@bracket", "foreground": "fc8f00" },
    { "token": "volta", "foreground": "FFFF00" },
    { "token": "barline", "foreground": "fc8f00" },
    { "token": "repeat", "foreground": "FFFF00" },
    { "token": "press-release", "foreground": "fcde00" },
    { "token": "tie", "foreground": "fcde00" }
]`
    document.getElementById('gen').onclick = () => {
        try {
            ColorRules = JSON.parse((<HTMLTextAreaElement>this.document.getElementById('color')).value)
        } catch (error) {
            alert('Invalid json!')
            ColorRules = ColorRulesDefault
        }
        defineLanguage()
        showEditor()
    }
}

function defineLanguage() {
    monaco.languages.register({
        id: 'smml',
        extensions: ['sml']
    })
    // monaco.languages.setTokensProvider('qy', new LineTokenizer())
    monaco.editor.defineTheme('smml', {
        base: 'vs-dark',
        inherit: true,
        rules: ColorRules,
        colors: {}
    })
    monaco.languages.setMonarchTokensProvider('smml', {
        tokenizer: {
            root: [
                {
                    regex: /\/\/.*/,
                    action: {
                        token: 'comment'
                    }
                },
                {
                    regex: /# *Track/,
                    action: {
                        token: '@rematch',
                        next: 'Macro'
                    }
                },
                {
                    regex: /# *Chord/,
                    action: {
                        token: '@rematch',
                        next: 'ChordDef'
                    }
                },
                {
                    regex: /# *Include/,
                    action: {
                        token: '@rematch',
                        next: '@Inc'
                    }
                },
                {
                    regex: /<\*[a-z]+\*>/,
                    action: {
                        token: '@rematch',
                        next: '@pop'
                    }
                },
                {
                    regex: /# *End/,
                    action: {
                        token: '@rematch',
                        next: '@pop'
                    }
                },
                {
                    regex: /@[a-z]+/,
                    action: {
                        token: 'macroIndicator'
                    }
                },
                {
                    regex: /\[(\d\.)+\]/,
                    action: {
                        token: 'volta'
                    }
                },
                {
                    regex: /:\|\|:|:\|\||\|\|:|\|\||\|/,
                    action: {
                        token: 'barline'
                    }
                },
                {
                    regex: /\d+\*|\/\d*:/,
                    action: {
                        token: 'repeat'
                    }
                },
                {
                    regex: /&/,
                    action: {
                        token: 'press-release'
                    }
                },
                {
                    regex: /\*/,
                    action: {
                        token: 'press-release'
                    }
                },
                {
                    regex: /\^/,
                    action: {
                        token: 'tie'
                    }
                },
                {
                    regex: /{/,
                    action: {
                        bracket: '@open',
                        token: '@bracket',
                    }
                },
                {
                    regex: /}/,
                    action: {
                        bracket: '@close',
                        token: '@bracket',
                    }
                },
                {
                    regex: /\([^\)]+\)/,
                    action: {
                        token: 'sfunc'
                    }
                },
                {
                    regex: /([A-Z][a-z]+)+\([^\)]+\)/,
                    action: {
                        token: 'func'
                    }
                },
                {
                    regex: /<[^*]+>/,
                    action: {
                        token: 'instr'
                    }
                },
                {
                    regex: /[\d%]/,
                    action: {
                        token: 'degree',
                        next: 'NoteOp'
                    }
                },
                {
                    regex: /\[/,
                    action: {
                        token: '@rematch',
                        next: 'Chord'
                    }
                }
            ],
            NoteOp: [
                {
                    regex: /[^',b#a-zA-Z\-_\.=`:>]/,
                    action: {
                        token: '@rematch',
                        next: '@pop'
                    }
                },
                {
                    regex: /[',b#a-zA-Z]/,
                    action: {
                        token: 'pitOp-chord'
                    }
                },
                {
                    regex: /[\-_\.=`:>]/,
                    action: {
                        token: 'durOp-stac-volOp'
                    }
                }
            ],
            Chord: [
                {
                    regex: /\[/,
                    action: {
                        token: '@rematch',
                        next: 'ChordInside'
                    }
                },
                {
                    regex: /[',b#a-zA-Z]/,
                    action: {
                        token: 'pitOp-chord'
                    }
                },
                {
                    regex: /[^',b#a-zA-Z\-_\.=`:>]/,
                    action: {
                        token: '@rematch',
                        next: '@pop'
                    }
                },
                {
                    regex: /[\-_\.=`:>]/,
                    action: {
                        token: 'durOp-stac-volOp'
                    }
                }
            ],
            ChordInside: [
                {
                    regex: /\[/,
                    action: {
                        token: 'chordBracket'
                    }
                },
                {
                    regex: /[\d%]/,
                    action: {
                        token: 'degree',
                    }
                },
                {
                    regex: /[',b#a-zA-Z]/,
                    action: {
                        token: 'pitOp-chord'
                    }
                },
                {
                    regex: /\]/,
                    action: {
                        token: 'chordBracket',
                        next: '@pop'
                    }
                }
            ],
            ChordDef: [
                {
                    regex: /# *Chord/,
                    action: {
                        token: 'macro',
                        bracket: '@open',
                    }
                },
                {
                    regex: /# *End/,
                    action: {
                        token: 'macro',
                        bracket: '@close',
                        next: '@pop'
                    }
                },
                {
                    regex: /^.+$/,
                    action: {
                        token: '@rematch',
                        next: 'ChordDefLine'
                    }
                },
            ],
            ChordDefLine: [
                {
                    regex: /^[a-zA-Z]/,
                    action: {
                        token: 'pitOp-chord',
                    }
                },
                {
                    regex: /\t+[^\t]+\t+/,
                    action: {
                        token: 'comment',
                    }
                },
                {
                    regex: /.*/,
                    action: {
                        token: 'pitOp-chord',
                        next: '@pop'
                    }
                },
            ],
            Macro: [
                {
                    regex: /# *Track/,
                    action: {
                        token: 'macro',
                        bracket: '@open',
                    }
                },
                {
                    regex: /<\*[a-z]+\*>/,
                    action: {
                        token: 'macroIndicator',
                        next: 'root'
                    }
                },
                {
                    regex: /# *End/,
                    action: {
                        token: 'macro',
                        bracket: '@close',
                        next: '@pop'
                    }
                },
            ],
            Inc: [
                {
                    regex: /# *Include/,
                    action: {
                        token: 'inc'
                    }
                },
                {
                    regex: /".*"/,
                    action: {
                        token: 'incPath',
                        next: '@pop'
                    }
                }
            ],
            Section: [

            ],
            Track: []
        },
        tokenPostfix: '.sml',
        defaultToken: 'undef'
    })
    monaco.languages.registerDefinitionProvider('smml', {
        provideDefinition(model, position, token) {
            const matches = model.findMatches('@[a-z]+', false, true, false, '', true)
            const trueMatch = matches.find((match) => match.range.startLineNumber === position.lineNumber && match.range.endLineNumber === position.lineNumber && match.range.startColumn <= position.column && match.range.endColumn >= position.column)
            if (!trueMatch) return
            const def = model.findMatches(`<*${trueMatch.matches[0].slice(1)}*>`, false, false, true, '', false)[0]
            return {
                uri: model.uri,
                range: def.range
            }
        }
    })
    monaco.languages.registerCompletionItemProvider('smml', {
        triggerCharacters: ['<'],
        provideCompletionItems(model, position, token) {
            const char = model.getValueInRange({ startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: position.column - 1, endColumn: position.column })
            if (char === '<') {
                return [
                    {
                        label: 'Piano',
                        kind: monaco.languages.CompletionItemKind.Variable,
                        documentation: 'Piano',
                        insertText: 'Piano>'
                    }
                ]
            }
            return []
        }
    })
}

function showEditor() {
    document.body.innerHTML = ''
    const element = document.createElement('div')
    element.id = "container"
    element.style.width = "100%"
    element.style.height = "100%"
    element.style.overflow = "hidden"
    document.body.appendChild(element)
    const editor = monaco.editor.create(element, {
        language: 'smml',
        theme: 'smml',
        folding: true
    });
    (<any>window).editor = editor
    window.onresize = () => {
        editor.layout()
    }
}