import nerdamer from "nerdamer";
import Question from "./question";
import { Utils } from "./utils";

interface ParseError extends Error { }

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
    let fn = Utils.pickFromArray([ "sin", "cos", "tan" ]);
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

export function pickRandomQuestion(): Question {
    return pickRandomTrigQuestion();
}

const questions = [
    //
];

const QuestionGenerator = {
};
