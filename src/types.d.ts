type DeepPartial<O> = {
  [P in keyof T]?: DeepPartial<T[P]>;
}