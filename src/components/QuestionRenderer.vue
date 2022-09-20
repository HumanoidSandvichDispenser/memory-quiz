<template>
    <td class="left">
        <li>
            <katex-element display-mode :expression="question" />
        </li>
    </td>
    <td v-if="isAnswerVisible">
        <katex-element display-mode :expression="answer" />
    </td>
    <td v-else class="right">
        &mdash;
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
        index: Number,
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

<style scoped>
.left {
    text-align: left;
    padding-right: 32px;
}

.right {
    text-align: right;
}
</style>
