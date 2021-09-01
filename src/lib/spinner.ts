const logSymbols = require("log-symbols");
const ora = require("ora");

const startSpinner = (text: string) =>
  ora({
    text,
  }).start();

const stopSpinner = (spinner: any, text: string, error: boolean) => {
  if (!spinner) {
    return;
  }
  const symbol = error ? logSymbols.error : logSymbols.success;
  spinner.stopAndPersist({
    text,
    symbol,
  });
};

const clearSpinner = (spinner: any) => {
  if (spinner) {
    spinner.stop();
  }
};

export { clearSpinner, startSpinner, stopSpinner };
