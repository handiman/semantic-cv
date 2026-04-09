export default function pipe(
  ...steps: Array<(value: any, context: any) => any>
) {
  return function (initial: any = {}, context: any = {}) {
    let current = initial;
    let isAsync = false;

    for (const step of steps) {
      if (isAsync) {
        current = Promise.resolve(current).then(() => step(current, context));
      } else {
        try {
          current = step(current, context);
          if (current instanceof Promise) {
            isAsync = true;
          }
        } catch (err) {
          throw err;
        }
      }
    }

    return current;
  };
}
