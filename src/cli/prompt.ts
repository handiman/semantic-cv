import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

/**
 * Minimal interface for interactive CLI prompting.
 *
 * Implementations must:
 *   - ask a question and resolve with the user's trimmed answer
 *   - fall back to a default value when the user submits an empty line
 *   - provide a `close()` method to release underlying resources
 */
export interface IPrompt {
  ask(question: string, defaultValue?: string): Promise<string | undefined>;
  close(): void;
}

/**
 * Default readline-based prompt used by the Semantic‑CV CLI.
 *
 * The prompt:
 *   - displays the question, optionally showing a default value
 *   - trims whitespace from the user's input
 *   - returns the default value when the user submits an empty line
 *   - closes the underlying readline interface when finished
 */
export default class Prompt implements IPrompt {
  private rl: readline.Interface;
  constructor(rl = readline.createInterface({ input, output })) {
    this.rl = rl;
    this.ask = this.ask.bind(this);
  }

  async ask(question: string, defaultValue?: string) {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    const answer = (await this.rl.question(prompt)).trim();
    return answer !== "" ? answer : (defaultValue ?? undefined);
  }

  close() {
    this.rl.close();
  }
}
