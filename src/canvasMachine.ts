import { fromEvent, filter, debounceTime } from 'rxjs'
import { assign, fromEventObservable, setup } from "xstate"

export const canvasMachine = setup({
  types: {
    context: {} as {
      count: number
    },
    events: {} as
      | { type: 'CLICK' }
  },

  actors: {
    mouseClick: fromEventObservable(({self}) => {
      const event = fromEvent(document.body, 'click')
      event.pipe(
        filter((event: any) => {
            console.log('what is shift', event.shiftKey)
            return event.shiftKey
        }),
        debounceTime(300)
      ).subscribe((event) => {
        console.log('what is subscribed event', event)
        self.send({ type: 'CLICK'})
      })

      return event
    }),
  }
}).createMachine({
  id: 'canvas',
  context: {
    count: 0
  },
  invoke: {
    src: 'mouseClick',
  },
  on: {
    CLICK: {
      actions: assign({
        count: ({ context }) => context.count + 1
      })
    }
  }
})