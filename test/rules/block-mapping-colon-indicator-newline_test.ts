import { RuleTester } from "eslint";
import { yaml } from "../../lib/main.js";

const ruleTester = new RuleTester({
	plugins: {
		yaml,
	},
	language: "yaml/yaml",
});

const rule = yaml.rules!["block-mapping-colon-indicator-newline"];

ruleTester.run("block-mapping-colon-indicator-newline", rule, {
  valid: [
    'foo: 303',
    '{foo: 303}',
    '{foo:\n303}',
    '{foo}',
    'foo:',
    ': 303',
    'foo:\n  - a',
    {code: 'foo:\n  303', options: ['always']}
  ],
  invalid: [
    {
      "code": "&a: key: &a value\nfoo:\n  *a:\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 3,
          "column": 4
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "plain:\n  This unquoted scalar\n  spans many lines.\n\nquoted: \"So does this\n  quoted scalar.\\n\"\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 6
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "canonical: !!binary \"\\\n R0lGODlhDAAMAIQAAP//9/X17unp5WZmZgAAAOfn515eXvPz7Y6OjuDg4J+fn5\\\n OTk6enp56enmlpaWNjY6Ojo4SEhP/++f/++f/++f/++f/++f/++f/++f/++f/+\\\n +f/++f/++f/++f/++f/++SH+Dk1hZGUgd2l0aCBHSU1QACwAAAAADAAMAAAFLC\\\n AgjoEwnuNAFOhpEMTRiggcz4BNJHrv/zCFcLiwMWYNG84BwwEeECcgggoBADs=\"\ngeneric: !!binary |\n R0lGODlhDAAMAIQAAP//9/X17unp5WZmZgAAAOfn515eXvPz7Y6OjuDg4J+fn5\n OTk6enp56enmlpaWNjY6Ojo4SEhP/++f/++f/++f/++f/++f/++f/++f/++f/+\n +f/++f/++f/++f/++f/++SH+Dk1hZGUgd2l0aCBHSU1QACwAAAAADAAMAAAFLC\n AgjoEwnuNAFOhpEMTRiggcz4BNJHrv/zCFcLiwMWYNG84BwwEeECcgggoBADs=\ndescription:\n The binary value above is a tiny arrow encoded as a gif image.\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 12,
          "column": 12
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Folding:\n  \"Empty line\n   \t\n  as a line feed\"\nChomping: |\n  Clipped empty lines\n \n\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 8
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "key:    # Comment\n  value\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 4
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "!<tag:yaml.org,2002:str> foo :\n  !<!bar> baz\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 30
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: b\n c\nd:\n e\n  f\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 4,
          "column": 2
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "!!str &a1 \"foo\":\n  !!str bar\n&a2 baz : *a1\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 16
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "literal: |2\n  value\nfolded:\n   !foo\n  >1\n value\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 4,
          "column": 7
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "key:    # Comment\n        # lines\n  value\n\n\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 4
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "{ first: Sammy, last: Sosa }:\n# Statistics:\n  hr:  # Home runs\n     65\n  avg: # Average\n   0.278\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 4,
          "column": 5
        },
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 6,
          "column": 6
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: \"double\n  quotes\" # lala\nb: plain\n value  # lala\nc  : #lala\n  d\n? # lala\n - seq1\n: # lala\n - #lala\n  seq2\ne: &node # lala\n - x: y\nblock: > # lala\n  abcde\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 6,
          "column": 4
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nTime: 2001-11-23 15:01:42 -5\nUser: ed\nWarning:\n  This is an error message\n  for the log file\n---\nTime: 2001-11-23 15:02:31 -5\nUser: ed\nWarning:\n  A slightly different error\n  message.\n---\nDate: 2001-11-23 15:03:17 -5\nUser: ed\nFatal:\n  Unknown variable \"bar\"\nStack:\n  - file: TopClass.py\n    line: 23\n    code: |\n      x = MoreObject(\"345\\n\")\n  - file: MoreClass.py\n    line: 58\n    code: |-\n      foo = bar\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 5,
          "column": 8
        },
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 11,
          "column": 8
        },
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 17,
          "column": 6
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Folding:\n  \"Empty line\n\n  as a line feed\"\nChomping: |\n  Clipped empty lines\n \n\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 8
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: \"double\n  quotes\" # lala\nb: plain\n value  # lala\nc  : #lala\n  d\n? # lala\n - seq1\n: # lala\n - #lala\n  seq2\ne:\n &node # lala\n - x: y\nblock: > # lala\n  abcde\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 6,
          "column": 4
        }
      ],
      "options": [
        "never"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "&a: key: &a value\nfoo:\n  *a:\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 3,
          "column": 4
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "plain:\n  This unquoted scalar\n  spans many lines.\n\nquoted: \"So does this\n  quoted scalar.\\n\"\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 6
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "canonical: !!binary \"\\\n R0lGODlhDAAMAIQAAP//9/X17unp5WZmZgAAAOfn515eXvPz7Y6OjuDg4J+fn5\\\n OTk6enp56enmlpaWNjY6Ojo4SEhP/++f/++f/++f/++f/++f/++f/++f/++f/+\\\n +f/++f/++f/++f/++f/++SH+Dk1hZGUgd2l0aCBHSU1QACwAAAAADAAMAAAFLC\\\n AgjoEwnuNAFOhpEMTRiggcz4BNJHrv/zCFcLiwMWYNG84BwwEeECcgggoBADs=\"\ngeneric: !!binary |\n R0lGODlhDAAMAIQAAP//9/X17unp5WZmZgAAAOfn515eXvPz7Y6OjuDg4J+fn5\n OTk6enp56enmlpaWNjY6Ojo4SEhP/++f/++f/++f/++f/++f/++f/++f/++f/+\n +f/++f/++f/++f/++f/++SH+Dk1hZGUgd2l0aCBHSU1QACwAAAAADAAMAAAFLC\n AgjoEwnuNAFOhpEMTRiggcz4BNJHrv/zCFcLiwMWYNG84BwwEeECcgggoBADs=\ndescription:\n The binary value above is a tiny arrow encoded as a gif image.\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 12,
          "column": 12
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Folding:\n  \"Empty line\n   \t\n  as a line feed\"\nChomping: |\n  Clipped empty lines\n \n\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 8
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "key:    # Comment\n  value\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 4
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "!<tag:yaml.org,2002:str> foo :\n  !<!bar> baz\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 30
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: b\n c\nd:\n e\n  f\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 4,
          "column": 2
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "!!str &a1 \"foo\":\n  !!str bar\n&a2 baz : *a1\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 16
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "literal: |2\n  value\nfolded:\n   !foo\n  >1\n value\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 4,
          "column": 7
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "key:    # Comment\n        # lines\n  value\n\n\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 4
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "{ first: Sammy, last: Sosa }:\n# Statistics:\n  hr:  # Home runs\n     65\n  avg: # Average\n   0.278\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 4,
          "column": 5
        },
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 6,
          "column": 6
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: \"double\n  quotes\" # lala\nb: plain\n value  # lala\nc  : #lala\n  d\n? # lala\n - seq1\n: # lala\n - #lala\n  seq2\ne: &node # lala\n - x: y\nblock: > # lala\n  abcde\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 6,
          "column": 4
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nTime: 2001-11-23 15:01:42 -5\nUser: ed\nWarning:\n  This is an error message\n  for the log file\n---\nTime: 2001-11-23 15:02:31 -5\nUser: ed\nWarning:\n  A slightly different error\n  message.\n---\nDate: 2001-11-23 15:03:17 -5\nUser: ed\nFatal:\n  Unknown variable \"bar\"\nStack:\n  - file: TopClass.py\n    line: 23\n    code: |\n      x = MoreObject(\"345\\n\")\n  - file: MoreClass.py\n    line: 58\n    code: |-\n      foo = bar\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 5,
          "column": 8
        },
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 11,
          "column": 8
        },
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 17,
          "column": 6
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Folding:\n  \"Empty line\n\n  as a line feed\"\nChomping: |\n  Clipped empty lines\n \n\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 2,
          "column": 8
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: \"double\n  quotes\" # lala\nb: plain\n value  # lala\nc  : #lala\n  d\n? # lala\n - seq1\n: # lala\n - #lala\n  seq2\ne:\n &node # lala\n - x: y\nblock: > # lala\n  abcde\n",
      "errors": [
        {
          "message": "Unexpected line break after this `:` indicator.",
          "line": 6,
          "column": 4
        }
      ],
      "options": [],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "-\n  name: Mark McGwire\n  hr:   65\n  avg:  0.278\n-\n  name: Sammy Sosa\n  hr:   63\n  avg:  0.288\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "\"top1\" : \n  \"key1\" : &alias1 scalar1\n'top2' : \n  'key2' : &alias2 scalar2\ntop3: &node3 \n  *alias1 : scalar3\ntop4: \n  *alias2 : scalar4\ntop5   :    \n  scalar5\ntop6: \n  &anchor6 'key6' : scalar6\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 10
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 10
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 13,
          "column": 19
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a!\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~: safe\n?foo: safe question mark\n:foo: safe colon\n-foo: safe dash\nthis is#not: a comment\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 40
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 12
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "&a: key: &a value\nfoo:\n  *a:\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 8
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "--- !!map\n? a\n: b\n--- !!seq\n- !!str c\n--- !!str\nd\ne\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nplain: a\n b\n\n c\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "First occurrence: &anchor Foo\nSecond occurrence: *anchor\nOverride anchor: &anchor Bar\nReuse anchor: *anchor\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 17
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 18
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 16
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 13
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "escaped slash: \"a\\/b\"\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 14
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "plain:\n  This unquoted scalar\n  spans many lines.\n\nquoted: \"So does this\n  quoted scalar.\\n\"\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "plain: text\n  lines\nquoted: \"text\n  \tlines\"\nblock: |\n  text\n   \tlines\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "canonical: !!binary \"\\\n R0lGODlhDAAMAIQAAP//9/X17unp5WZmZgAAAOfn515eXvPz7Y6OjuDg4J+fn5\\\n OTk6enp56enmlpaWNjY6Ojo4SEhP/++f/++f/++f/++f/++f/++f/++f/++f/+\\\n +f/++f/++f/++f/++f/++SH+Dk1hZGUgd2l0aCBHSU1QACwAAAAADAAMAAAFLC\\\n AgjoEwnuNAFOhpEMTRiggcz4BNJHrv/zCFcLiwMWYNG84BwwEeECcgggoBADs=\"\ngeneric: !!binary |\n R0lGODlhDAAMAIQAAP//9/X17unp5WZmZgAAAOfn515eXvPz7Y6OjuDg4J+fn5\n OTk6enp56enmlpaWNjY6Ojo4SEhP/++f/++f/++f/++f/++f/++f/++f/++f/+\n +f/++f/++f/++f/++f/++SH+Dk1hZGUgd2l0aCBHSU1QACwAAAAADAAMAAAFLC\n AgjoEwnuNAFOhpEMTRiggcz4BNJHrv/zCFcLiwMWYNG84BwwEeECcgggoBADs=\ndescription:\n The binary value above is a tiny arrow encoded as a gif image.\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 10
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 8
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "sequence: !!seq\n- entry\n- !!seq\n - nested\nmapping: !!map\n foo: bar\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "literal: |\n  some\n  text\nfolded: >\n  some\n  text\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Folding:\n  \"Empty line\n   \t\n  as a line feed\"\nChomping: |\n  Clipped empty lines\n \n\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "? explicit key # Empty value\n? |\n  block key\n: - one # Explicit compact\n  - two # block value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "- foo:\t bar\n- - baz\n  -\tbaz\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\n&mapping\n&key [ &item a, b, c ]: value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 23
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "'foo: bar\\': baz'\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 12
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "  # Leading comment line spaces are\n   # neither content nor indentation.\n    \nNot indented:\n By one space: |\n    By four\n      spaces\n Flow style: [    # Leading spaces\n   By two,        # in flow style\n  Also by two,    # are neither\n  \tStill by two   # content nor\n    ]             # indentation.\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 14
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 12
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "foo: !!seq\n  - !!str a\n  - !!map\n    key: !!str value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 8
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "? &a a\n: &b b\n: *a\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 1
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "\"foo\\nbar:baz\\tx \\\\$%^&*()x\": 23\n'x\\ny:z\\tx $%^&*()x': 24\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 29
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 21
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Document\n---\n# Empty\n...\n%YAML 1.2\n---\nmatches %: 20\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 10
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "-\n  \"flow in block\"\n- >\n Block scalar\n- !!map # Block collection\n  foo : bar\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "!!str a: b\nc: !!int 42\ne: !!str f\ng: h\n!!int 23: !!bool false\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nnot-date: !!str 2002-04-28\n\npicture: !!binary |\n R0lGODlhDAAMAIQAAP//9/X\n 17unp5WZmZgAAAOfn515eXv\n Pz7Y6OjuDg4J+fn5OTk6enp\n 56enmleECcgggoBADs=\n\napplication specific tag: !something |\n The semantics of the tag\n above may be different for\n different documents.\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 11,
          "column": 25
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\ntop1: &node1\n  &k1 key1: one\ntop2: &node2 # comment\n  key2: two\ntop3:\n  &k3 key3: three\ntop4: &node4\n  &k4 key4: four\ntop5: &node5\n  key5: five\ntop6: &val6\n  six\ntop7:\n  &val7 seven\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 10,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 11,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 12,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 13,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nscalar1\n...\nkey: value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "'implicit block key' : [\n  'implicit flow key' : value,\n ]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 22
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 23
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nkey ends with two colons::: value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 27
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "[\n\"double\n quoted\", 'single\n           quoted',\nplain\n text, [ nested ],\nsingle: pair,\n]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": " - key: value\n   key2: value2\n -\n   key3: value3\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 8
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Mapping: Document\n---\n# Empty\n...\n%YAML 1.2\n---\nmatches %: 20\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 10
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a:\n  b:\n    c: d\n  e:\n    f: g\nh: i\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "foo:\n  bar: baz\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\n&a1\n!!str\nscalar1\n---\n!!str\n&a2\nscalar2\n---\n&a3\n!!str scalar3\n---\n&a4 !!map\n&a5 !!str key5: value4\n---\na6: 1\n&anchor6 b6: 2\n---\n!!map\n&a8 !!str key8: value7\n---\n!!map\n!!str &a10 key10: value9\n---\n!!str &a11\nvalue11\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 15,
          "column": 15
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 17,
          "column": 3
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 18,
          "column": 12
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 21,
          "column": 15
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 24,
          "column": 17
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "- [ YAML : separate ]\n- [ : empty key entry ]\n- [ \"JSON like\":adjacent ]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 10
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 16
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "single: 'text'\ndouble: \"text\"\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\n# Products purchased\n- item    : Super Hoop\n  quantity: 1\n- item    : Basketball\n  quantity: 4\n- item    : Big Shoes\n  quantity: 1\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 11
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "? a\n: -\tb\n  -  -\tc\n     - d\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "strip: |-\n  text\nclip: |\n  text\nkeep: |+\n  text\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: b\n c\nd:\n e\n  f\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "1:\n- 2\n- 3\n4: 5\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "- bla\"keks: foo\n- bla]keks: foo\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 11
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "key: &anchor\n !!map\n  a: b\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "%TAG ! tag:clarkevans.com,2002:\n--- !shape\n  # Use the ! handle for presenting\n  # tag:clarkevans.com,2002:circle\n- !circle\n  center: &ORIGIN {x: 73, y: 129}\n  radius: 7\n- !line\n  start: *ORIGIN\n  finish: { x: 89, y: 102 }\n- !label\n  start: *ORIGIN\n  color: 0xFFEEBB\n  text: Pretty vector drawing.\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 10,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 11,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 13,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 14,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 15,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "&flowseq [\n a: b,\n &c c: d,\n { &e e: f },\n &g { g: h }\n]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 3
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "[\n? foo\n bar : baz\n]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "anchored: !local &anchor value\nalias: *anchor\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: [b, c]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "foo: bar\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: b\t\nseq:\t\n - a\t\nc: d\t#X\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "&a a: &b b\n*a : *b\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": " # Strip\n  # Comments:\nstrip: |-\n  # text\n  \n # Clip\n  # comments:\n\nclip: |\n  # text\n \n # Keep\n  # comments:\n\nkeep: |+\n  # text\n\n # Trail\n  # comments.\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 10,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 16,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "safe: a!\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~\n     !\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~\nsafe question mark: ?foo\nsafe colon: :foo\nsafe dash: -foo\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 10
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "- !!str\n-\n  !!null : a\n  b: !!str\n- !!str : !!null\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 10
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "unicode: \"Sosa did fine.\\u263A\"\ncontrol: \"\\b1998\\t1999\\t2000\\n\"\nhex esc: \"\\x0d\\x0a is \\r\\n\"\n\nsingle: '\"Howdy!\" he cried.'\nquoted: ' # Not a ''comment''.'\ntie-fighter: '|\\-*-/|'\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 12
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "? a\n: 13\n1.5: d\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 1
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "foo: 1\n\nbar: 2\n    \ntext: |\n  a\n    \n  b\n\n  c\n \n  d\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nwanted: love ♥ and peace ☮\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "name: Mark McGwire\naccomplishment: >\n  Mark set a major league\n  home run record in 1998.\nstats: |\n  65 Home Runs\n  0.278 Batting Average\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 15
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "!!str &a1 \"foo\":\n  !!str bar\n&a2 baz : *a1\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "# Tabs and spaces\nquoted: \"Quoted \t\"\nblock:\t|\n  void main() {\n  \tprintf(\"Hello, world!\\n\");\n  }\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "foo: blue\nbar: arrr\nbaz: jazz\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "# Ordered maps are represented as\n# A sequence of mappings, with\n# each mapping having one key\n--- !!omap\n- Mark McGwire: 65\n- Sammy Sosa: 63\n- Ken Griffy: 58\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 15
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 13
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 13
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "1: 2\n\n\n3: 4\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "block sequence:\n  - one\n  - two : three\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "First occurrence: &anchor Value\nSecond occurrence: *anchor\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 17
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 18
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "? a\n  true\n: null\n  d\n? e\n  42\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "strip: >-\n\nclip: >\n\nkeep: |+\n\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "foo:\n  bar: 1\nbaz: 2\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "- [ YAML : separate ]\n- [ : empty key entry ]\n- [ {JSON: like}:adjacent ]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 10
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 17
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "? !!str a\n: !!int 47\n? c\n: !!str d\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 1
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "implicit block key : [\n  implicit flow key : value,\n ]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 20
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 21
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "\"implicit block key\" : [\n  \"implicit flow key\" : value,\n ]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 22
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 23
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "[flow]: block\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: |\n ab\n \n cd\n ef\n \n\n...\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "literal: |2\n  value\nfolded:\n   !foo\n  >1\n value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 8
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "? - Detroit Tigers\n  - Chicago cubs\n:\n  - 2001-07-23\n\n? [ New York Yankees,\n    Atlanta Braves ]\n: [ 2001-07-02, 2001-08-12,\n    2001-08-14 ]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\na: b\n---\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "[\nfoo: bar\n]\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: 4.2\n? 23\n: d\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 1
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: \"double\n  quotes\" # lala\nb: plain\n value  # lala\nc  : #lala\n  d\n? # lala\n - seq1\n: # lala\n - #lala\n  seq2\ne: &node # lala\n - x: y\nblock: > # lala\n  abcde\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 13,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 14,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 15,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\nTime: 2001-11-23 15:01:42 -5\nUser: ed\nWarning:\n  This is an error message\n  for the log file\n---\nTime: 2001-11-23 15:02:31 -5\nUser: ed\nWarning:\n  A slightly different error\n  message.\n---\nDate: 2001-11-23 15:03:17 -5\nUser: ed\nFatal:\n  Unknown variable \"bar\"\nStack:\n  - file: TopClass.py\n    line: 23\n    code: |\n      x = MoreObject(\"345\\n\")\n  - file: MoreClass.py\n    line: 58\n    code: |-\n      foo = bar\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 10,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 15,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 16,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 20,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 21,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 22,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 24,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 25,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 26,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "plain key: in-line value\n: # Both empty\n\"quoted key\":\n- entry\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 10
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "aaa: bbb\n...\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "sequence:\n- one\n- two\nmapping:\n  ? sky\n  : blue\n  sea : green\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 3
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "hr:  65    # Home runs\navg: 0.278 # Batting average\nrbi: 147   # Runs Batted In\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 3
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 4
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 4
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "block mapping:\n key: value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\ntop1: &node1\n  &k1 key1: one\ntop2: &node2 # comment\n  key2: two\ntop3:\n  &k3 key3: three\ntop4:\n  &node4\n  &k4 key4: four\ntop5:\n  &node5\n  key5: five\ntop6: &val6\n  six\ntop7:\n  &val7 seven\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 11,
          "column": 11
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 14,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 15,
          "column": 5
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\ntime: 20:03:20\nplayer: Sammy Sosa\naction: strike (miss)\n...\n---\ntime: 20:03:47\nplayer: Sammy Sosa\naction: grand slam\n...\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 8,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 7
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 10,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "sequence: [ one, two, ]\nmapping: { sky: blue, sea: green }\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 9
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 8
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "--- !<tag:clarkevans.com,2002:invoice>\ninvoice: 34843\ndate   : 2001-01-23\nbill-to: &id001\n    given  : Chris\n    family : Dumars\n    address:\n        lines: |\n            458 Walkman Dr.\n            Suite #292\n        city    : Royal Oak\n        state   : MI\n        postal  : 48046\nship-to: *id001\nproduct:\n    - sku         : BL394D\n      quantity    : 4\n      description : Basketball\n      price       : 450.00\n    - sku         : BL4438H\n      quantity    : 1\n      description : Super Hoop\n      price       : 2392.00\ntax  : 251.42\ntotal: 4443.52\ncomments:\n    Late afternoon is best.\n    Backup contact is Nancy\n    Billsmer @ 338-4338.\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 12
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 12
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 9,
          "column": 14
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 12,
          "column": 17
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 13,
          "column": 17
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 14,
          "column": 17
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 15,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 17,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 18,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 19,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 20,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 21,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 22,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 23,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 24,
          "column": 19
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 25,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 26,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "- sun: yellow\n- ? earth: blue\n  : moon: white\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 6
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 10
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 3
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "- # Empty\n- |\n block node\n- - one # Compact\n  - two # sequence\n- one: two # Compact mapping\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 7,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: &:@*!$\"<foo>: scalar a\nb: *:@*!$\"<foo>:\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Folding:\n  \"Empty line\n\n  as a line feed\"\nChomping: |\n  Clipped empty lines\n \n\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 6,
          "column": 9
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "a: \"double\n  quotes\" # lala\nb: plain\n value  # lala\nc  : #lala\n  d\n? # lala\n - seq1\n: # lala\n - #lala\n  seq2\ne:\n &node # lala\n - x: y\nblock: > # lala\n  abcde\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 15,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 16,
          "column": 6
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "literal: |2\n  value\nfolded: !foo >1\n value\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 8
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 4,
          "column": 7
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "Mark McGwire: {hr: 65, avg: 0.278}\nSammy Sosa: {\n    hr: 63,\n    avg: 0.288\n  }\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 13
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 11
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "&a a: b\nc: &d d\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 2,
          "column": 5
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 2
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    },
    {
      "code": "---\na: 1\n? b\n&anchor c: 3\n",
      "errors": [
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 3,
          "column": 2
        },
        {
          "message": "Expected a line break after this `:` indicator.",
          "line": 5,
          "column": 10
        }
      ],
      "options": [
        "always"
      ],
      "settings": {
        "yml": {
          "indent": 8
        }
      }
    }
  ]
});
