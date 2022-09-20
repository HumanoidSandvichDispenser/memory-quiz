import nerdamer, { diff } from "nerdamer";
import "nerdamer/Algebra.js";
import "nerdamer/Calculus.js";
import "nerdamer/Solve.js";
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
        fn: "\\frac{\\sin(a x)}{b x}",
        answer: "\\frac{a}{b}",
        constants: [ "a", "b" ],
        isTeX: true
    },
    {
        limit: "\\lim_{x \\to 0}",
        fn: "\\frac{\\sin(c x)}{x}",
        answer: "c",
        constants: [ "c" ],
        isTeX: true
    },
    {
        limit: "\\lim_{x \\to c}",
        fn: "abs(x - c)/(x - c)",
        answer: "DNE",
        constants: [ "c" ],
        isTeX: false
    },
    {
        limit: "\\lim_{x \\to \\infty}",
        fn: "sin(x)",
        answer: "DNE",
        constants: [ "c" ],
        isTeX: false
    }
]

// if the element is undefined, it will be computed by nerdamer
// instead of being explicitly defined
const derivatives: {[key: string]: string} = {
    "\\sin(x)": "\\cos(x)",
    "\\cos(x)": "-\\sin(x)",
    "\\tan(x)": "\\sec^2(x)",
    "\\cot(x)": "-\\csc^2(x)",
    "\\sec(x)": "\\sec(x)\\tan(x)",
    "\\csc(x)": "-\\csc(x)\\cot(x)",
    "\\arcsin(x)": "\\frac{1}{\\sqrt{1 - x^2}}",
    "\\arccos(x)": "-\\frac{1}{\\sqrt{1 - x^2}}",
    "\\arctan(x)": "\\frac{1}{x^2 + 1}",
    "\\arccot(x)": "-\\frac{1}{x^2 + 1}",
    "\\arcsec(x)": "\\frac{1}{|x|\\sqrt{x^2 - 1}}",
    "\\arccsc(x)": "-\\frac{1}{|x|\\sqrt{x^2 - 1}}",
    "\\ln(x)": "\\frac{1}{x}",
    "\\log_n(x)": "\\frac{1}{\\ln n \\cdot x}",
    "e^x": "e^x",
    "n^x": "\\ln n \\cdot n^x",
    "x^n": "nx^{n - 1}",
    "f(g(x))": "f'(g(x)) g'(x)",
    "f(x) g(x)": "f'(x)g(x) + g'(x)f(x)",
    "\\frac{f(x)}{g(x)}": "\\frac{f'(x)g(x) - g'(x)f(x)}{g(x)^2}",
}

const derivativeTheory: {[key: string]: string} = {
    "\\textrm{If} f'(x) > 0, f(x) \\textrm{is}": "\\textrm{increasing}",
    "\\textrm{If} f'(x) < 0, f(x) \\textrm{is}": "\\textrm{decreasing}",
    "\\textrm{If} f''(x) > 0, f(x) \\textrm{is}": "\\textrm{concave up}",
    "\\textrm{If} f''(x) < 0, f(x) \\textrm{is}": "\\textrm{concave down}",
    "\\textrm{If} f'(x)f''(x) < 0, \\textrm": "\\textrm{concave down}",
    "\\textrm{If} f'(x) \\cdot f''(x) < 0, f(x) \\textrm{is}": "\\textrm{slowing down}"
}

const geometry: {[key: string]: string} = {
    "A_\\textrm{circle}": "\\pi r^2",
    "C_\\textrm{circle}": "2\\pi r",
    "V_\\textrm{cylinder}": "\\pi r^2 h",
    "SA_\\textrm{cylinder}": "2\\pi r h + 2\\pi r^2",
    "V_\\textrm{sphere}": "\\frac{4}{3} \\pi r^3",
    "SA_\\textrm{sphere}": "\\frac{4} \\pi r^2",
}

const physics: {[key: string]: string} = {
    "\\frac{d}{dt} s(t)": "v(t)",
    "\\frac{d}{dt} v(t)": "a(t)",
    "\\frac{d^2}{dt^2} s(t)": "a(t)",
    "\\int v(t) dt": "s(t)",
    "\\int a(t) dt": "a(t)",
    "\\int \\int a(t) dt": "s(t)",
}

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
        if (fn == "sec" && angle.text() == "0") {
            answer = "1"
        } else {
            answer = nerdamer.convertFromLaTeX(tex).toTeX();
        }
    } catch (p) {
        if (p instanceof Error) {
            if (p.message.startsWith("tan is undefined for")) {
                return new Question(tex, "\\textrm{undefined}");
            }
        }
    }
    return new Question(tex, answer);
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

function pickRandomLimit(): Question {
    let limit: Limit = Utils.pickFromArray(specialLimits);
    let limitName = limit.limit;
    let fn = limit.isTeX ? nerdamer.convertFromLaTeX(limit.fn) : nerdamer(limit.fn);
    let answer = limit.isTeX ? nerdamer.convertFromLaTeX(limit.answer) : nerdamer(limit.answer);
    limit.constants.forEach(constant => {
        let num = Utils.random(1, 9).toString();
        console.log(`Substituting ${constant} for ${num}`);
        limitName = limit.limit.replaceAll(constant, num);
        fn = fn.sub(constant, num).evaluate();
        answer = answer.sub(constant, num);
    });
    return new Question(`${limitName} ${fn.toTeX()}`, answer.toTeX());
}

function pickRandomDerivative(): Question {
    let fn = Utils.pickFromArray(Object.keys(derivatives));
    return new Question(`\\frac{d}{dx} ${fn}`, derivatives[fn]);
}

function pickRandomDerivativeTheory(): Question {
    let theory = Utils.pickFromArray(Object.keys(derivativeTheory));
    return new Question(theory, derivativeTheory[theory]);
}

function pickRandomGeometry(): Question {
    let fn = Utils.pickFromArray(Object.keys(geometry));
    return new Question(fn, geometry[fn]);
}

function pickRandomPhysics(): Question {
    let fn = Utils.pickFromArray(Object.keys(physics));
    return new Question(fn, physics[fn]);
}

export function pickRandomQuestion(): Question {
    let questions = [
        pickRandomTrigQuestion,
        pickRandomInverseTrigQuestion,
        pickRandomLimit,
        pickRandomDerivative,
        pickRandomDerivativeTheory,
        pickRandomPhysics
    ]
    return Utils.pickFromArray(questions)();
}
