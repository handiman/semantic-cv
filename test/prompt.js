export default class FakePrompt {
  constructor(values) {
    this.values = values;
  }
  ask(question, defaultValue) {
    const answer = this.values.splice(0, 1)[0];
    return answer ?? defaultValue;
  }
  close() {}
}
