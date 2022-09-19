<template>
    <div class="left-column">
        <h3>Time left: {{ timeLeftFormatted }}</h3>
        <button @click="startQuiz">{{ isRunning ? "Stop" : "Start" }}</button>
    </div>
    <div>
        <ol>
            <table>
                <tr v-for="question, i in questions" :key="i">
                    <question-renderer :question="question.question"
                                    :answer="question.answer"
                                    :isAnswerVisible="!isRunning"
                                    :index="i" />
                </tr>
            </table>
        </ol>
    </div>
</template>

<script lang="ts">
import nerdamer from "nerdamer";
import { Options, Vue } from "vue-class-component";
import QuestionRenderer from "./components/QuestionRenderer.vue";
import Question from "./question";
import { pickRandomQuestion } from "./question-generator";

@Options({
    components: {
        QuestionRenderer
    },
})
export default class App extends Vue {
    private interval: number = NaN;
    private timeLeft: number = 0;
    private questions: Question[] = [];
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
        let exp = nerdamer.convertFromLaTeX("\\sin(m x)\cdot m");
        console.log(exp.sub("m", "2").toTeX());
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
            this.questions.push(pickRandomQuestion());
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
</style>
