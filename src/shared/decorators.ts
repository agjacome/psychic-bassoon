export const sealed: ClassDecorator = constructor => {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
};
