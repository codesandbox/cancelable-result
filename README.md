# cancelable-result
A tiny utility for cancelable results

## The problem

When we write application logic we want to be very explicit about dealing with errors. We want to have a typed interface for application specific errors, which are dealt with differently than critical language errors like `SyntaxError` etc. Also writing asynchronous code we want to cancel promises. This is evident with React `useEffect` where you run promises and want to avoid async dispatches when the effect has been disposed. Currently the language has no built in way of properly dealing with this.

## The inspiration

Rust is a language that deals with errors through a `Result`. There are already implementations of this in JavaScript/TypeScript, like [nothrow](https://github.com/DaAitch/nothrow) and [ts-results](https://github.com/vultix/ts-results). These are great solutions, but goes way beyond the simple need of returning an async result.

Cancelable promises is very tricky to implement, as you can chain promises. But from the perspective of a cancelable result it becomes more straight forward. By using a typical React pattern of:

```ts
React.useEffect(() => {
  let shouldRun = true
  somePromise.then(() => {
    if (shouldRun) {
      // Actually run lgoic
    }
  })
  return () => {
    shouldRun = false
  }
}, [])
```

we have what we need to create a cancelable result.

## The solution

```ts
import { Result, Ok, Err } from 'cancelable-result'

const someSideEffect = () => {
  const promise = doSomething()
    .then((value) => Ok(value))
    .catch(() => Err('SOME_ERROR'))
  
  return Result(promise)
}

React.useEffect(() => {
  const { promise, cancel } = someSideEffect()
  
  promise.then((result) => {
    if (result.ok) {
      result.value // Typed result
      
      return
    }
    
    switch (result.error) {
      case 'SOME_ERROR': {

      }
    }
  })
  
  return () => cancel()
}, [])
```


