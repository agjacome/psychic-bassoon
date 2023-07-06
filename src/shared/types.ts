declare const basetype: unique symbol;
declare const newtype: unique symbol;

export type Opaque<Base, New = unknown> = Base &
  Readonly<{
    [basetype]: Base;
    [newtype]: [New];
  }>;
