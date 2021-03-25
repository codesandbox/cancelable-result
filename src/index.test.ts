import { Result, Ok, Err } from "./";

describe("cancelable-result", () => {
  test("should create a promise", done => {
    expect.assertions(2);

    const { promise } = Result(Promise.resolve(Ok("foo")));

    promise.then(result => {
      if (result.ok) {
        expect(result.ok).toBe(true);
        expect(result.value).toBe("foo");
      }
      done();
    });
  });
  test("should cancel a result", done => {
    expect.assertions(1);

    const { cancel, promise } = Result(Promise.resolve(Err("foo")));

    promise.then(result => {
      if (result.ok === false) {
        expect(result.error).toBe("CANCELLED");
      }
      done();
    });

    cancel();
  });
});
