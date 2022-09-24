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
        &mdash; {{ mathFieldTeX }}
    </td>
    <td v-if="isTextboxEnabled">
        <!--vue-tiptap-katex v-model="text" /-->
        <math-field class="mathField" keypress-sound="null" plonk-sound="null" ref="mathField"
                    @input="handleInput" placeholder="test">test</math-field>
    </td>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import nerdamer from "nerdamer";
import { MathJax } from "mathjax-vue3";
import { pickRandomCommonAngle } from "../question-generator";
import { MathfieldElement } from "mathlive";
import "mathlive/dist/mathlive-fonts.css";
import "mathlive/dist/mathlive";

@Options({
    props: {
        isAnswerVisible: Boolean,
        isTextboxEnabled: Boolean,
        question: String,
        answer: String,
        index: Number,
    },
    components: {
        MathJax,
    }
})
export default class QuestionRenderer extends Vue {
    isAnswerVisible!: boolean;
    question!: string;
    answer!: string;
    textInput: string = "";

    handleInput(): void {
        let str = (this.$refs["mathField"] as MathfieldElement).getValue("latex");
        console.log(str);
    }

    public get mathField(): MathfieldElement {
        return this.$refs["mathField"] as MathfieldElement;
    }

    public get mathFieldTeX(): string {
        //return this.mathField.getValue("latex");
        return (this.$refs["mathField"] as MathfieldElement).getValue("latex");
    }
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
