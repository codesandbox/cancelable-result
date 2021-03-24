export type Ok<V> = {
  ok: true;
  value: V;
};

type Err<E extends string> = {
  ok: false;
  error: E;
};

export type Result<V, E extends string> = Ok<V> | Err<E>;

const CANCELLED_ERROR = "CANCELLED" as const;

export function Ok<V>(value: V): Ok<V> {
  return {
    ok: true,
    value,
  };
}

export function Err<E extends string>(error: E): Err<E> {
  return {
    ok: false,
    error,
  };
}

export function Result<V, E extends string>(
  promise: Promise<Result<V, E | "CANCELLED">>
): {
  promise: Promise<Result<V, E | "CANCELLED">>;
  cancel: () => void;
} {
  let isCancelled = false;

  return {
    promise: new Promise((resolve) => {
      promise
        .then((result) => {
          if (!isCancelled) {
            return result;
          }

          resolve({
            ok: false,
            error: CANCELLED_ERROR,
          });
        })
        .catch((error) => {
          if (!isCancelled) {
            // This error is considered critical and will throw
            // as normal, like syntax errors etc.
            throw error;
          }

          resolve({
            ok: false,
            error: CANCELLED_ERROR,
          });
        });
    }),
    cancel: () => {
      isCancelled = true;
    },
  };
}
