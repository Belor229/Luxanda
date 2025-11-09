/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T
  export function useMemo<T>(factory: () => T, deps: any[] | undefined): T
  export function useRef<T>(initialValue: T): { current: T }
  export function useContext<T>(context: React.Context<T>): T
  export function useReducer<R extends React.Reducer<any, any>>(
    reducer: R,
    initialState: React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>]
  export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void
  export function useImperativeHandle<T, R extends T>(
    ref: React.Ref<T>,
    init: () => R,
    deps?: any[]
  ): void
  export function useDebugValue<T>(value: T, format?: (value: T) => any): void

  export interface FormEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T
  }

  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T
  }

  export interface SyntheticEvent<T = Element, E = Event> {
    bubbles: boolean
    cancelable: boolean
    currentTarget: EventTarget & T
    defaultPrevented: boolean
    eventPhase: number
    isTrusted: boolean
    nativeEvent: E
    preventDefault(): void
    isDefaultPrevented(): boolean
    stopPropagation(): void
    isPropagationStopped(): boolean
    persist(): void
    target: EventTarget & T
    timeStamp: number
    type: string
  }

  export interface Context<T> {
    Provider: React.ComponentType<{ value: T; children?: React.ReactNode }>
    Consumer: React.ComponentType<{ children: (value: T) => React.ReactNode }>
    displayName?: string
  }

  export interface Component<P = {}, S = {}> {
    props: P
    state: S
    setState(state: Partial<S> | ((state: S, props: P) => Partial<S>), callback?: () => void): void
    forceUpdate(callback?: () => void): void
    render(): React.ReactElement
  }

  export interface ComponentType<P = {}> {
    (props: P, context?: any): React.ReactElement | null
    displayName?: string
    defaultProps?: Partial<P>
    propTypes?: any
  }

  export type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = {
    type: T
    props: P
    key: string | number | null
  }

  export type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNode[]

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>)

  export interface RefObject<T> {
    current: T | null
  }

  export type Ref<T> = RefObject<T> | ((instance: T | null) => void) | null | undefined

  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement | null
    displayName?: string
    defaultProps?: Partial<P>
    propTypes?: any
  }

  export interface FC<P = {}> extends FunctionComponent<P> {}

  export interface ComponentClass<P = {}, S = ComponentState> {
    new (props: P, context?: any): Component<P, S>
    displayName?: string
    defaultProps?: Partial<P>
    propTypes?: any
  }

  export interface ComponentState {}

  export interface Reducer<S, A> {
    (prevState: S, action: A): S
  }

  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never

  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<infer A> ? A : never

  export type Dispatch<A> = (value: A) => void

  export function createContext<T>(defaultValue: T): Context<T>
  export function createElement<P extends {}>(
    type: string | ComponentType<P>,
    props?: P & { children?: ReactNode },
    ...children: ReactNode[]
  ): ReactElement<P>
  export function cloneElement<P extends {}>(
    element: ReactElement<P>,
    props?: Partial<P> & { children?: ReactNode },
    ...children: ReactNode[]
  ): ReactElement<P>
  export function isValidElement(object: any): object is ReactElement
  export function Children: {
    map<T, C>(children: C | C[], fn: (child: C, index: number) => T): T[]
    forEach<C>(children: C | C[], fn: (child: C, index: number) => void): void
    count(children: any): number
    only<C>(children: C): C extends ReactElement ? C : never
    toArray<C>(children: C | C[]): C[]
  }
  export function memo<T extends ComponentType<any>>(
    Component: T,
    propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
  ): T
  export function lazy<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>
  ): T
  export function Suspense(props: { children?: ReactNode; fallback: ReactNode }): ReactElement
  export function Fragment(props: { children?: ReactNode }): ReactElement
  export function StrictMode(props: { children?: ReactNode }): ReactElement
  export function Profiler(props: {
    id: string
    onRender: (id: string, phase: 'mount' | 'update', actualDuration: number, baseDuration: number, startTime: number, commitTime: number) => void
    children?: ReactNode
  }): ReactElement
  export function createRef<T>(): RefObject<T>
  export function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => ReactElement | null
  ): ComponentType<P & { ref?: Ref<T> }>
  export function useRef<T = undefined>(): RefObject<T | undefined>
  export function useRef<T>(initialValue: T): RefObject<T>
  export function useRef<T>(initialValue: T | null): RefObject<T | null>
  export function useRef<T = undefined>(): RefObject<T | undefined>
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode
    }
    interface ElementAttributesProperty {
      props: {}
    }
    interface ElementChildrenAttribute {
      children: {}
    }
    interface IntrinsicAttributes extends React.Attributes {}
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}