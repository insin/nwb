export type ErrBack = (err?: ?Error) => void;

export type ServerConfig = {
  port?: number,
  historyApiFallback?: boolean | Object,
  host?: string,
};
