export type ErrorValue = {
  type: string;
  data?: any;
};

export type Ok<V> = {
  ok: true;
  value: V;
};

type Err<E extends ErrorValue> = {
  ok: false;
  error:
    | E
    | {
        type: "CANCELLED";
      };
};

export type Result<V, E extends ErrorValue> = {
  promise: Promise<Ok<V> | Err<E>>;
  cancel: () => void;
};

const CANCELLED_ERROR = "CANCELLED" as const;

export function Ok<V>(value: V): Ok<V> {
  return {
    ok: true,
    value
  };
}

export function Err<E extends string>(type: E): Err<{ type: E }>;
export function Err<E extends string, D extends any>(
  type: E,
  data: D
): Err<{ type: E; data: D }>;
export function Err<E extends string, D extends any>(
  type: E,
  data?: D
): Err<{ type: E; data?: D }> {
  return {
    ok: false,
    error: {
      type,
      data
    }
  };
}

export function Result<V, E extends ErrorValue>(
  promise: Promise<Ok<V> | Err<E>>
): Result<V, E> {
  let isCancelled = false;

  return {
    promise: new Promise((resolve, reject) => {
      promise
        .then(result =>
          resolve(
            isCancelled
              ? {
                  ok: false,
                  error: {
                    type: CANCELLED_ERROR
                  }
                }
              : result
          )
        )
        .catch(error => {
          if (!isCancelled) {
            // If the promise passed in throws an error reject our promise, which
            // will lead to an unhandled promise exception... but, you should already
            // have catched this in your result implementation to give specific errors
            reject(error);
          }

          resolve({
            ok: false,
            error: {
              type: CANCELLED_ERROR
            }
          });
        });
    }),
    cancel: () => {
      isCancelled = true;
    }
  };
}
