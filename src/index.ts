export type Ok<V> = {
  ok: true;
  value: V;
};

type Err<E extends string> = {
  ok: false;
  error: E | "CANCELLED";
};

export type Result<V, E extends string> = {
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

export function Err<E extends string>(error: E): Err<E> {
  return {
    ok: false,
    error
  };
}

export function Result<V, E extends string>(
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
                  error: CANCELLED_ERROR
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
            error: CANCELLED_ERROR
          });
        });
    }),
    cancel: () => {
      isCancelled = true;
    }
  };
}
