import { assign, fromCallback, setup } from 'xstate'

export const timerMachine = setup({
  actions: {
    EXTEND: assign({
      duration: ({ context }) => context.duration + 60
    })
  },
  types: {
    context: {} as {
      elapsed: number
      format: string,
      duration: number,
      interval: number,
    },
    events: {} as
      | { type: 'EXTEND' }
      | { type: 'TICK' }
      | { type: 'TOGGLE' }
      | { type: 'RESET' }
      | { type: 'NEXT', duration: number }
  },
  guards: {
    isZeroOrLess: ({ context }) => {
      const { duration, elapsed } = context
      return duration - elapsed <= 0
    }
  }
}).createMachine({
  id: 'timer',
  initial: 'idle',
  context: {
    duration: 100,
    format: 'whole',
    elapsed: 0,
    interval: 0.2
  },
  states: {
    idle: {
      on: {
        TOGGLE: 'running',
        EXTEND: ''
      }
    },
    running: {
      //https://stately.ai/docs/actors#fromcallback
      invoke: {
        id: 'tick',
        input: ({ context }) => context.interval,
        src: fromCallback(({ input, sendBack }) => {
          const interval = setInterval(() => {
            sendBack({ type: 'TICK' })
          }, input.interval * 1000)
          return () => clearInterval(interval)
        })
      },
      always: {
        guard: 'isZeroOrLess',
        target: 'finished'
      },
      on: {
        TOGGLE: 'idle',
        EXTEND: {
          actions: assign({
            duration: ({ context }) => context.duration + 60
          })
        },
        TICK: {
          actions: assign({
            elapsed: ({ context }) => context.elapsed + context.interval
          })
        }
      }
    },
    paused: {
      on: {
        TOGGLE: 'running',
        EXTEND: ''
        //RESET : 'reset to current block state'
      }
    },
    finished: {
      on: {
        //RESET: '.idle',
        EXTEND: '',
        NEXT : {
          actions:  assign({
            duration: ({ event }) => event.duration,
            elapsed: 0
          }),
          target: 'idle'
        }
      }
    },
    on: {}
  }
})