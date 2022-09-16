<template>
    <h1>Time left: {{ timeLeftFormatted }}</h1>
    <table>
        <tr>
            <td>QUAESTIO</td>
            <td>RESPONSVM</td>
        </tr>
        <tr v-for="question in questions">
            <question-renderer :question="question.question"
                               :answer="question.answer"
                               :isAnswerVisible="!isRunning" />
        </tr>
    </table>
    <button @click="startQuiz">{{ isRunning ? "Stop" : "Start" }}</button>
</template>

<script lang="ts">
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
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
