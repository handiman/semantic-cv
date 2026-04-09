import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export interface IPrompt {
  ask(question: string, defaultValue?: string): Promise<string | undefined>;
  close(): void;
}

export default class Prompt implements IPrompt {
  private rl: readline.Interface;
  constructor(rl = readline.createInterface({ input, output })) {
    this.rl = rl;
    this.ask = this.ask.bind(this);
  }

  async ask(question: string, defaultValue?: string) {
    const prompt = defaultValue
      ? `${question} (${defaultValue}): `
      : `${question}: `;
    const answer = (await this.rl.question(prompt)).trim();
    return answer !== "" ? answer : (defaultValue ?? undefined);
  }

  close() {
    this.rl.close();
  }
}
