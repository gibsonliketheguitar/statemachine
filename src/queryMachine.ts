import { fromPromise, setup } from "xstate"

export const queryMachine = setup({
  types: {
    context: {} as {
      data: []
    },
    events: {} as
      | { type: 'FETCH' }
  },
}).createMachine({
  id: 'canvas',
  initial: 'idle',
  context: {
    data: []
  },
  states: {
    idle: {
      on: {
        FETCH: 'fetching'
      }
    },
    loading: {
      invoke: {
        id: 'fetch',
        src: fromPromise(async () => {
          try {
            const response = await fetch('https://dummyjson.com/products/1')
            const data = await response.json()
          }
          catch (error) {
            target: error
          }

        }),
        onDone: {
          target: 'idle'
        }
      },
    },
    error: {
    }
  }
})