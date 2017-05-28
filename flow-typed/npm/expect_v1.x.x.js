declare type $npm$expect$ErrorMatcher<T> = Class<T> | Error | RegExp | string;

declare type $npm$expect$Spy = Function & {
  (...args: any[]): any;
  andCall<R>(f: () => R): R;
  andCallThrough(): any;
  andReturn(value: any): any;
  andThrow(error: any): any;
  restore(): any;
  reset(): any;
  calls: Array<{
    context: any;
    arguments: Array<any>;
  }>;
};

declare type $npm$expect$ComparatorFunction = {
  (left: any, right: any): boolean;
}
declare type $npm$expect$HasKeyFunction = {
  (object: any, propertyName: string): boolean;
}
declare class $npm$expect$Expectation<T> {
  toExist(message?: string): this;
  toNotExist(message?: string): this;
  toBe(expected: T, message?: string): this;
  toNotBe(expected: T, message?: string): this;
  toEqual(expected: any, message?: string): this;
  toNotEqual(expected: any, message?: string): this;
  toThrow<E>(error?: $npm$expect$ErrorMatcher<E>, message?: string): this;
  toNotThrow<E>(error?: $npm$expect$ErrorMatcher<E>, message?: string): this;
  toBeA(constructor: mixed, message?: string): this;
  toNotBeA(constructor: mixed, message?: string): this;
  toMatch(pattern: any, message?: string): this;
  toNotMatch(pattern: any, message?: string): this;

  toBeLessThan(n: T & number, message?: string): this;
  toBeLessThanOrEqualTo(n: T & number, message?: string): this;
  toBeGreaterThan(n: T & number, message?: string): this;
  toBeGreaterThanOrEqualTo(n: T & number, message?: string): this;

  toInclude(value: any, comparator?: $npm$expect$ComparatorFunction, message?: string): this;
  toNotInclude(value: any, comparator?: $npm$expect$ComparatorFunction, message?: string): this;
  toContain(value: any, comparator?: $npm$expect$ComparatorFunction, message?: string): this;
  toNotContain(value: any, comparator?: $npm$expect$ComparatorFunction, message?: string): this;
  toExclude(value: any, comparator?: $npm$expect$ComparatorFunction, message?: string): this;

  toIncludeKey(key: string, hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toNotIncludeKey(key: string, hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toContainKey(key: string, hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toNotContainKey(key: string, hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toExcludeKey(key: string, hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;

  toIncludeKeys(keys: string[], hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toNotIncludeKeys(keys: string[], hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toContainsKeys(keys: string[], hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toNotContainKeys(keys: string[], hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;
  toExcludeKeys(key: string[], hasKeyFn?: $npm$expect$HasKeyFunction, message?: string): this;

  toHaveBeenCalled(message?: string): this;
  toNotHaveBeenCalled(message?: string): this;
  toHaveBeenCalledWith(...args: any[]): this;

}

declare type $npm$expect$ExpectStatic<Expectation> = {
  (actual: mixed): Expectation;
  assert(cond: boolean, message: string, ...extra: any[]): void;
  extend(spec: Object): any;
  createSpy(): $npm$expect$Spy;
  isSpy(o: any): boolean;
  spyOn(o: any, propertyName: string): $npm$expect$Spy;
  restoreSpies(): void;
}

declare module 'expect' {

  declare function assert(cond: boolean, message: string, ...extra: any[]): void;

  declare function extend(spec: any): any;

  declare function createSpy(): $npm$expect$Spy;

  declare function isSpy(o: any): boolean;

  declare function spyOn(o: any, propertyName: string): $npm$expect$Spy;

  declare function restoreSpies(): void;

  declare var exports: $npm$expect$ExpectStatic<$npm$expect$Expectation<mixed>>;
}
