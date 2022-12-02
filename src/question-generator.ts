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

// this is used for inverse trig functions
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
        "\\frac{\\pi}{2}",
        "\\frac{2\\pi}{3}",
        "\\frac{3\\pi}{4}",
        "\\frac{5\\pi}{6}",
        "\\pi",
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
        "\\frac{\\pi}{2}",
        "\\frac{2\\pi}{3}",
        "\\frac{3\\pi}{4}",
        "\\frac{5\\pi}{6}",
        "\\pi",
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
    "\\sin^{-1}(x)": "\\frac{1}{\\sqrt{1 - x^2}}",
    "\\cos^{-1}(x)": "-\\frac{1}{\\sqrt{1 - x^2}}",
    "\\tan^{-1}(x)": "\\frac{1}{x^2 + 1}",
    "\\cot^{-1}(x)": "-\\frac{1}{x^2 + 1}",
    "\\sec^{-1}(x)": "\\frac{1}{|x|\\sqrt{x^2 - 1}}",
    "\\csc^{-1}(x)": "-\\frac{1}{|x|\\sqrt{x^2 - 1}}",
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
    "\\textrm{If } f'(x) > 0, f(x) \\textrm{ is}": "\\textrm{increasing}",
    "\\textrm{If } f'(x) < 0, f(x) \\textrm{ is}": "\\textrm{decreasing}",
    "\\textrm{If } f''(x) > 0, f(x) \\textrm{ is}": "\\textrm{concave up}",
    "\\textrm{If } f''(x) < 0, f(x) \\textrm{ is}": "\\textrm{concave down}",
    //"\\textrm{If } f'(x)f''(x) < 0, \\textrm"{ }: "\\textrm{concave down}",
    "\\textrm{If } f'(x) \\cdot f''(x) < 0, f(x) \\textrm{is}": "\\textrm{slowing down}"
}

const geometry: {[key: string]: string} = {
    "A_\\textrm{circle}": "\\pi r^2",
    "C_\\textrm{circle}": "2\\pi r",
    "V_\\textrm{cylinder}": "\\pi r^2 h",
    "SA_\\textrm{cylinder}": "2\\pi r h + 2\\pi r^2",
    "V_\\textrm{sphere}": "\\frac{4}{3} \\pi r^3",
    "SA_\\textrm{sphere}": "4 \\pi r^2",
    "A_\\textrm{trapezoid}": "\\frac{b_1 + b_2}{2} \\cdot h"
}

const physics: {[key: string]: string} = {
    "\\frac{d}{dt} s(t)": "v(t)",
    "\\frac{d}{dt} v(t)": "a(t)",
    "\\frac{d^2}{dt^2} s(t)": "a(t)",
    "\\int v(t) dt": "s(t)",
    "\\int a(t) dt": "v(t)",
    "\\int \\int a(t) dt^2": "s(t)",
}

const identities: {[key: string]: string} = {
    "\\sin^2(x) + \\cos^2(x)": "1",
    "\\sec^2(x)": "\\tan^2(x) + 1",
    "\\csc^2(x)": "\\cot^2(x) + 1",
    "\\tan^2(x) + 1": "\\sec^2(x)",
    "\\cot^2(x) + 1": "\\csc^2(x)",
    "\\sin(a + b)": "\\sin a \\cos b + \\cos a \\sin b",
    "\\sin(a - b)": "\\sin a \\cos b - \\cos a \\sin b",
    "\\cos(a + b)": "\\cos a \\cos b - \\sin a \\sin b",
    "\\cos(a - b)": "\\cos a \\cos b + \\sin a \\sin b",
    "\\sin(2x)": "2\\sin x \\cos x",
    "\\cos^2(x) - \\sin^2(x)": "\\cos(2x)",
    "2\\cos^2(x) - 1": "\\cos(2x)",
    "1 - 2\\sin^2(x)": "\\cos(2x)",
    "\\tan(2x)": "\\frac{2 \\tan x}{1 - \\tan^2 x}"
};

const integrationRules: {[key: string]: string} = {
    "\\int x^n dx": "\\frac{x^{n + 1}}{n + 1}",
    "\\int (f(x) + g(x))dx": "\\int f(x)dx + \\int g(x)dx",
    "\\int_a^b f(x)dx + \\int_b^c f(x)dx": "\\int_a^c f(x)dx",
    "F(b) - F(a)": "\\int_a^b f(x)dx",
    "\\frac{d}{dx} \\int_a^x f(t)dt": "f(x)",
    "\\textrm{Average value of } f(x)": "\\frac{1}{b - a} \\int_a^b f(x)dx",
    "F(x) + C": "\\int f(x)dx",
    "\\int x^{-1} dx": "\\ln|x| + C"
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

function pickRandomTrigIdentity(): Question {
    let identity = Utils.pickFromArray(Object.keys(identities));
    let answer = identities[identity];
    return new Question(identity, answer);
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

function pickRandomGraphAnalysis(): Question {
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

function pickRandomIntegrationRule(): Question {
    let fn = Utils.pickFromArray(Object.keys(integrationRules));
    return new Question(fn, integrationRules[fn]);
}

export function pickRandomQuestion(categories: {[key: string]: any}): Question {
    /*
    let questions = {
        pickRandomTrigQuestion: enabledQuestion[0],
        pickRandomInverseTrigQuestion: enabledQuestion[1],
        pickRandomLimit: enabledQuestion[2],
        pickRandomDerivative: enabledQuestion[3],
        pickRandomGraphAnalysis: enabledQuestion[4],
        pickRandomPhysics: enabledQuestion[5],
        pickRandomGeometry: enabledQuestion[6],
    }
    */
    let questionFunctions = Object.keys(categories)
        .filter(category => categories[category].enabled)
        .map(category => categories[category].fn);
    //Object.keys(questions).filter(key => questions[key]);
    return Utils.pickFromArray(questionFunctions)();
}

const QuestionGenerator = {
    pickRandomTrigQuestion,
    pickRandomInverseTrigQuestion,
    pickRandomTrigIdentity,
    pickRandomLimit,
    pickRandomDerivative,
    pickRandomGraphAnalysis,
    pickRandomGeometry,
    pickRandomPhysics,
    pickRandomIntegrationRule
};

export default QuestionGenerator;
