declare module 'run-series' {
  declare module.exports: (
    tasks: Array<((err: ?Error, result: ?any) => any) => any>,
    cb: (err: ?Error, results: any[]) => any
  ) => void;
};
