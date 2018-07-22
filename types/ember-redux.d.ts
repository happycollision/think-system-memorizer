declare interface IAction {
  type: string;
  [x: string]: any;
}

declare interface ReduxSerivce {
  dispatch(input: IAction): void;
}

declare module '@ember/service' {
  interface Registry {
    'redux': ReduxSerivce;
  }
}

declare module 'ember-redux' {
  export function connect(...things: any[]): (component: any) => any
}