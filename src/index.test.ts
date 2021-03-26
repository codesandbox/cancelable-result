import { Result, Ok, Err } from "./";

describe("cancelable-result", () => {
  test("should create a promise", (done) => {
    expect.assertions(2);

    const { promise } = Result(Promise.resolve(Ok("foo")));

    promise.then((result) => {
      result.match((value) => {
        expect(result.ok).toBe(true);
        expect(value).toBe("foo");
      }, {});
      done();
    });
  });
  test("should cancel a result", (done) => {
    expect.assertions(1);

    const { cancel, promise } = Result(Promise.resolve(Err("foo", 123)));

    const cb = jest.fn();
    promise.then((result) => {
      result.match(() => {}, {
        CANCELLED: cb,
      });
      expect(cb.mock.calls.length).toBe(1);
      done();
    });

    cancel();
  });
});
