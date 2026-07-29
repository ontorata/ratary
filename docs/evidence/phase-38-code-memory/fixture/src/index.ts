import { Greeter, greet } from './greet.js';

export function main(): void {
  const g = new Greeter('hi');
  console.log(g.say('world'));
  console.log(greet('ratary'));
}

main();
