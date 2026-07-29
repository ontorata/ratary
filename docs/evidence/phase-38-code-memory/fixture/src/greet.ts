/** Tiny fixture for Phase 38 Code Memory staging prove. */
export function greet(name: string): string {
  return `hello ${name}`;
}

export class Greeter {
  constructor(private readonly prefix: string) {}

  say(name: string): string {
    return `${this.prefix} ${greet(name)}`;
  }
}
