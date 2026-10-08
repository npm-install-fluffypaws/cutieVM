function run(program, print) {
  const stack = [];
  let pc = 0;
  let steps = 0;
  while (pc < program.length && steps++ < 100000) {
    const [op, arg] = program[pc++];
    switch (op) {
      case "PUSH":  stack.push(arg); break;
      case "ADD":   { const b = stack.pop(), a = stack.pop(); stack.push(a + b); break; }
      case "SUB":   { const b = stack.pop(), a = stack.pop(); stack.push(a - b); break; }
      case "DUP":   stack.push(stack[stack.length - 1]); break;
      case "PRINT": print(stack.pop()); break;
      case "JNZ":   if (stack.pop() !== 0) pc = arg; break;
      case "HALT":  return;
      default: print("Unknown op: " + op); return;
    }
  }
}
