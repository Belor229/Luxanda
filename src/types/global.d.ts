/// <reference types="react" />
/// <reference types="react-dom" />

/* 
declare module 'react' {
  // ... (manual overrides removed to avoid conflicts with @types/react)
}
*/

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode
    }
    interface ElementAttributesProperty {
      props: {}
    }
    interface ElementChildrenAttribute {
      children: {}
    }
    interface IntrinsicAttributes extends React.Attributes { }
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> { }
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}