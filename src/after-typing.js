export function afterTyping(callback, delay = 750) {
  let timer, args;
  const schedule = (...nextArgs) => {
    args = nextArgs;
    clearTimeout(timer);
    timer = setTimeout(run, delay);
  };
  schedule.flush = () => { if (timer) { clearTimeout(timer); run(); } };
  schedule.cancel = () => { clearTimeout(timer); timer = undefined; args = undefined; };
  function run() {
    timer = undefined;
    const currentArgs = args;
    args = undefined;
    if (currentArgs) callback(...currentArgs);
  }
  return schedule;
}
