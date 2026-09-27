export type RouteMatcher = string | RegExp | ((url: URL) => boolean);

export type JsonValue =
  string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

export type JsonObject = { [key: string]: JsonValue };

export type RouteCleanup = () => Promise<void>;

export interface InterceptContinueInfo<T = unknown> {
  method: string;
  payload: T;
  status?: number;
  url: string;
}

export interface InterceptValidateAndContinueOptions<T = unknown> {
  method?: string;
  urlExcludes?: string | RegExp;
  onIntercept?: (info: InterceptContinueInfo<T>) => void | Promise<void>;
}
