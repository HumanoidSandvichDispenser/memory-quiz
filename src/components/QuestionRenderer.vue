<template>
    <td>
        <katex-element :expression="question" />
    </td>
    <td v-if="isAnswerVisible">
        <katex-element :expression="answer" />
    </td>
    <td v-else>
        -
    </td>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import nerdamer from "nerdamer";
import { MathJax } from "mathjax-vue3";
import { pickRandomCommonAngle } from "../question-generator";

@Options({
    props: {
        isAnswerVisible: Boolean,
        question: String,
        answer: String,
    },
    components: {
        MathJax
    }
})
export default class QuestionRenderer extends Vue {
    isAnswerVisible!: boolean;
    question!: string;
    answer!: string;
}
</script>
