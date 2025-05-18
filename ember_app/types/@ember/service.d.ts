declare interface IAction {
  type: string;
  [x: string]: any;
}

declare interface ReduxService {
  dispatch(input: IAction): void;
  getState(): any;
}

declare module '@ember/service' {
  interface Registry {
    'redux': ReduxService;
  }
}

