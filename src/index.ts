export type Match<V, E extends ErrorValue> = (
  ok: (value: V) => void,
  err:
    | {
        [T in E["type"]]?: (error: E extends { type: T } ? E : never) => void;
      }
    | {
        CANCELLED: (error: { type: "CANCELLED" }) => void;
      }
) => void;

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
  promise: Promise<(Ok<V> | Err<E>) & { match: Match<V, E> }>;
  cancel: () => void;
};

const CANCELLED_ERROR = "CANCELLED" as const;

export function Ok<V>(value: V): Ok<V> {
  return {
    ok: true,
    value,
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
      data,
    },
  };
}

export function Result<V, E extends ErrorValue>(
  promise: Promise<Ok<V> | Err<E>>
): Result<V, E> {
  let isCancelled = false;

  const withMatch = (
    result: Ok<V> | Err<E>
  ): (Ok<V> | Err<E>) & { match: Match<V, E> } => {
    return Object.assign(result, {
      match: ((ok, errors) => {
        if (result.ok) {
          ok(result.value);
        } else {
          const errorType = result.error.type;
          // @ts-ignore
          const err = errors[errorType];

          err && err(result.error);
        }
      }) as Match<V, E>,
    });
  };

  return {
    promise: new Promise((resolve, reject) => {
      promise
        .then((result) =>
          resolve(
            withMatch(
              isCancelled
                ? {
                    ok: false,
                    error: {
                      type: CANCELLED_ERROR,
                    },
                  }
                : result
            )
          )
        )
        .catch((error) => {
          if (!isCancelled) {
            // If the promise passed in throws an error reject our promise, which
            // will lead to an unhandled promise exception... but, you should already
            // have catched this in your result implementation to give specific errors
            reject(error);
          }

          resolve(
            withMatch({
              ok: false,
              error: {
                type: CANCELLED_ERROR,
              },
            })
          );
        });
    }),
    cancel: () => {
      isCancelled = true;
    },
  };
}
