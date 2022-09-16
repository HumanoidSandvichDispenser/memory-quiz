export default class Question {
    public question: string = "";
    public answer: string = "";

    public constructor(q: string, a: string) {
        this.question = q;
        this.answer = a;
    }
}
