<template>
    <div class="left-column">
        <h3>Time left: {{ timeLeftFormatted }}</h3>
        <button @click="startQuiz">{{ isRunning ? "Stop" : "Start" }}</button>
        <h4>Settings</h4>
        <div>
            <input type="checkbox" v-model="categories.trig.enabled">
            <label for="checkbox">Trigonometry</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.inverseTrig.enabled">
            <label for="checkbox">Inverse Trigonometry</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.trigIdentities.enabled">
            <label for="checkbox">Trigonometric Identities</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.limits.enabled">
            <label for="checkbox">Limits</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.derivatives.enabled">
            <label for="checkbox">Derivatives</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.graphAnalysis.enabled">
            <label for="checkbox">Graph Analysis</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.geometry.enabled">
            <label for="checkbox">Geometry</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.physics.enabled">
            <label for="checkbox">Physics</label>
        </div>
        <div>
            <input type="checkbox" v-model="categories.integrationRules.enabled">
            <label for="checkbox">Integration Rules</label>
        </div>
        <div>
            <label for="checkbox">Time: {{ quizDuration }} seconds </label>
            <input type="range" min="60" max="240" step="5" v-model="quizDuration">
        </div>
        <div>
            <input type="checkbox" v-model="isTextboxEnabled" disabled>
            <label for="checkbox">Enable text input (testing only)</label>
        </div>
    </div>
    <div>
        <ol>
            <table>
                <tr v-for="question, i in questions" :key="i">
                    <question-renderer :question="question.question"
                                    :answer="question.answer"
                                    :is-answer-visible="!isRunning"
                                    :index="i"
                                    :is-textbox-enabled="isTextboxEnabled" />
                </tr>
            </table>
        </ol>
    </div>
</template>

<script lang="ts">
import nerdamer from 'nerdamer'
import 'nerdamer/Algebra.js'
import 'nerdamer/Calculus.js'
import 'nerdamer/Solve.js'
//import VueSlider from "vue-slider-component";
import { Options, Vue } from "vue-class-component";
import QuestionRenderer from "./components/QuestionRenderer.vue";
import Question from "./question";
import QuestionGenerator, { pickRandomQuestion } from "./question-generator";
import "./question-generator";

@Options({
    components: {
        QuestionRenderer,
    },
})
export default class App extends Vue {
    private interval: number = NaN;
    private timeLeft: number = 0;
    private questions: Question[] = [];
    private isTextboxEnabled: boolean = false;
    private categories = {
        trig: {
            enabled: true,
            fn: QuestionGenerator.pickRandomTrigQuestion
        },
        inverseTrig: {
            enabled: true,
            fn: QuestionGenerator.pickRandomInverseTrigQuestion
        },
        trigIdentities: {
            enabled: true,
            fn: QuestionGenerator.pickRandomTrigIdentity,
        },
        limits: {
            enabled: true,
            fn: QuestionGenerator.pickRandomLimit
        },
        derivatives: {
            enabled: true,
            fn: QuestionGenerator.pickRandomDerivative
        },
        graphAnalysis: {
            enabled: true,
            fn: QuestionGenerator.pickRandomGraphAnalysis
        },
        physics: {
            enabled: true,
            fn: QuestionGenerator.pickRandomPhysics
        },
        geometry: {
            enabled: true,
            fn: QuestionGenerator.pickRandomGeometry
        },
        integrationRules: {
            enabled: true,
            fn: QuestionGenerator.pickRandomIntegrationRule
        }
    };
    public quizDuration: number = 120;

    public get isRunning(): boolean {
        return !Number.isNaN(this.interval);
    }

    public get timeLeftFormatted(): string {
        let minutes = String(Math.floor(this.timeLeft / 60)).padStart(2, "0");
        let seconds = String(this.timeLeft % 60).padStart(2, "0");
        return minutes + ":" + seconds;
    }

    mounted(): void {
        for (let i = 0; i < 10; i++) {
            this.questions.push(new Question(`\\textrm{Question } ${i + 1}`, ""));
        }
    }

    stopQuiz(): void {
        clearInterval(this.interval);
        this.interval = NaN;
        console.log("Finished!!");

        //this.questions.forEach(q => q.finish());
    }

    pickQuestions() {
        this.questions.splice(0, this.questions.length);
        for (let i = 0; i < 10; i++) {
            this.questions.push(pickRandomQuestion(this.categories));
        }
    }

    startQuiz(): void {
        if (this.isRunning) {
            this.stopQuiz();
        } else {
            this.timeLeft = this.quizDuration;
            this.pickQuestions();
            this.interval = setInterval(() => {
                if (--this.timeLeft <= 0) {
                    this.stopQuiz();
                }
            }, 1000);
        }
    }
}
</script>

<style>
#app {
    display: flex;
}

#app > div {
    padding: 16px;
}

.left-column {
    width: 256px;
}

.tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;

    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
    visibility: visible;
}
</style>
