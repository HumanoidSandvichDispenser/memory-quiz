import nerdamer from "nerdamer";
import Question from "./question";
import { Utils } from "./utils";

interface ParseError extends Error { }

interface Limit {
    limit: string,
    fn: string,
    answer: string,
    constants: string[],
    isTeX: boolean
}

const trigFunctions = [ "sin", "cos", "tan", "csc", "sec", "cot" ];

const trigDomain: { [key: string]: string[] } = {
    "sin": [
        "0",
        "\\frac{\\pi}{6}",
        "\\frac{\\pi}{4}",
        "\\frac{\\pi}{3}",
        "\\frac{\\pi}{2}",
        "-\\frac{\\pi}{6}",
        "-\\frac{\\pi}{4}",
        "-\\frac{\\pi}{3}",
        "-\\frac{\\pi}{2}",
    ],
    "csc": [
        "\\frac{\\pi}{6}",
        "\\frac{\\pi}{4}",
        "\\frac{\\pi}{3}",
        "\\frac{\\pi}{2}",
        "-\\frac{\\pi}{6}",
        "-\\frac{\\pi}{4}",
        "-\\frac{\\pi}{3}",
        "-\\frac{\\pi}{2}",
    ],
    "cos": [
        "0",
        "\\frac{\\pi}{6}",
        "\\frac{\\pi}{4}",
        "\\frac{\\pi}{3}",
        "\\frac{\\pi}{2}",
        "\\frac{2\\pi}{3}",
        "\\frac{3\\pi}{4}",
        "\\frac{5\\pi}{6}",
        "\\pi",
    ],
    "sec": [
        "0",
        "\\frac{\\pi}{6}",
        "\\frac{\\pi}{4}",
        "\\frac{\\pi}{3}",
        "-\\frac{\\pi}{6}",
        "-\\frac{\\pi}{4}",
        "-\\frac{\\pi}{3}",
    ],
    "tan": [
        "\\frac{\\pi}{6}",
        "\\frac{\\pi}{4}",
        "\\frac{\\pi}{3}",
        "-\\frac{\\pi}{6}",
        "-\\frac{\\pi}{4}",
        "-\\frac{\\pi}{3}",
    ],
    "cot": [
        "\\frac{\\pi}{6}",
        "\\frac{\\pi}{4}",
        "\\frac{\\pi}{3}",
        "-\\frac{\\pi}{6}",
        "-\\frac{\\pi}{4}",
        "-\\frac{\\pi}{3}",
    ]
}

// "m" and "n" are random constants from 1 to 9
const specialLimits: Limit[] = [
    {
        limit: "\\lim_{x \\to 0}",
        fn: "\\frac{\\sin(m x)}{n x}",
        answer: "\\frac{m}{n}",
        constants: [ "m", "n" ],
        isTeX: true
    },
    {
        limit: "\\lim_{x \\to 0}",
        fn: "\\frac{\\sin(m x)}{x}",
        answer: "m",
        constants: [ "m" ],
        isTeX: true
    },
    {
        limit: "\\lim_{h \\to 0}",
        fn: "(sin(x - h) - sin(x))/h",
        answer: "\\diff(\\sin(x))",
        constants: [ ],
        isTeX: false
    },
    {
        limit: "\\lim_{x \\to m}",
        fn: "\\frac{abs(x - m)}{x - m}",
        answer: "\\mathrm{DNE}",
        constants: [ "m" ],
        isTeX: true
    },
]

/*

    "\\lim_{x \\to 0} \frac{\\sin(mx)}{nx}": "\\frac{m}{n}",
    "\\lim_{x \\to 0} \frac{\\sin(mx)}{x}": "m",
    "\\lim_{x \\to 0} \frac{\\sin(x)}{mx}": "\\frac{1}{m}"
  */

export function pickRandomCommonAngle(): nerdamer.Expression {
    let denominator = Utils.pickFromArray([ 4, 6 ]);
    let numerator = Utils.random(0, denominator * 2);
    let tex = `\\frac{${numerator} \\pi}{${denominator}}`;
    let frac = nerdamer.convertFromLaTeX(tex);
    console.log(tex);
    console.log(frac);
    return frac;
}

function pickRandomTrigQuestion(): Question {
    let angle = pickRandomCommonAngle();
    let tex = angle.toTeX().replace("\\cdot", "");
    let fn = Utils.pickFromArray(trigFunctions);
    tex = `\\${fn}(${tex})`;
    let answer = "\\textrm{undefined}";
    try {
        answer = nerdamer.convertFromLaTeX(tex).toTeX();
    } catch (p) {
        if (p instanceof Error) {
            if (p.message.startsWith("tan is undefined for")) {
                return new Question(tex, "\\textrm{undefined}");
            }
        }
    }
    return new Question(tex, answer);
}

function pickRandomLimit(): Question {
    let limit: Limit = Utils.pickFromArray(specialLimits);
    let fn = nerdamer.convertFromLaTeX(limit.fn);
    let answer = nerdamer.convertFromLaTeX(limit.answer);
    limit.constants.forEach(constant => {
        let num = Utils.random(1, 9).toString();
        console.log(`Substituting ${constant} for ${num}`);
        fn = fn.sub(constant, num).evaluate();
        answer = answer.sub(constant, num);
    });
    return new Question(`${limit.limit} ${fn.toTeX()}`, answer.toTeX());
}

function pickRandomInverseTrigQuestion(): Question {
    let fn = Utils.pickFromArray(trigFunctions);
    let angle = Utils.pickFromArray(trigDomain[fn]);
    let tex = `\\${fn}(${angle})`;

    let output;

    // strange bug where nerdamer doesn't resolve sec(0) to 1
    if (angle == "0" && fn == "sec") {
        output = nerdamer("1");
    } else {
        output = nerdamer.convertFromLaTeX(tex);
    }
    return new Question(`\\${fn}^{-1}(${output.toTeX()})`, angle);
}

export function pickRandomQuestion(): Question {
    let questions = [
        pickRandomTrigQuestion,
        pickRandomInverseTrigQuestion,
        pickRandomLimit,
    ]
    return Utils.pickFromArray(questions)();
}
