declare interface IAction {
  type: string;
  [x: string]: any;
}

declare interface ReduxService {
  dispatch(input: IAction): void;
}

declare module '@ember/service' {
  interface Registry {
    'redux': ReduxService;
  }
}

declare module 'ember-redux' {
  export function connect(...things: any[]): (component: any) => any
}