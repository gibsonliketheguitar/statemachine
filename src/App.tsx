import { useMachine } from "@xstate/react"
import { canvasMachine } from "./canvasMachine"
import { useEffect, useState } from "react"
import { timerMachine } from "./timerMachine"

export default function App() {
  const [state, send] = useMachine(timerMachine)
  const { duration, elapsed } = state.context

  const [input, setInput] = useState<number>(0)
  const handleInputChange = (e: any) => setInput(e.target.value)

  const [select, setSelect] = useState<string>('')
  const handleSelectChange = (e: any) => setSelect(e.target.value)

  const [block, setBlock] = useState<any>([])
  const handleAddBlock = () => {
    if (input <= 0 || select.length === 0) return

    const data = {
      id: block.length,
      type: select,
      duration: input
    }

    setBlock((prev: any) => [...prev, data])
  }

  const onDragStart = (event: any, sourceId: number) => {
    event.dataTransfer.setData('blockId', sourceId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (event: any, targetId: any) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const onDragDrop = (event: any, targetId: any) => {
    event.preventDefault()
    const sourceId = parseInt(event.dataTransfer.getData('blockId'))

    const targetBlock = block[targetId]
    const sourceBlock = block[sourceId]

    setBlock((prev: any) => {
      const newBlocks = prev.map((ele: any) => {
        if (ele.id === sourceId) return { ...targetBlock, id: ele.id }
        if (ele.id === targetId) return { ...sourceBlock, id: ele.id }
        return ele
      })
      return newBlocks
    })
  }

  const handleTimerToggle = () => {
    send({ type: 'TOGGLE' })
  }

  const [history, setHistory] = useState<any>([])

  const handleNextBlock = () => {

    const [head, ...rest] = block
    setBlock(rest)
    setHistory((prev: any) => [...prev, head])
    send({ type: 'NEXT', duration: rest[0].duration })
  }

  return (
    <div className='flex flex-col items-center bg-slate-500'>
      <div className='flex flex-col items-center w-full p-2 space-y-2'>
        <div className='flex justify-center items-center bg-slate-100 h-24 w-full rounded-md'>
          <div>{Math.ceil(duration - elapsed)}</div>
        </div>
        <div className="bg-slate-200 p-2 rounded-md">
          {state.matches('running') && <div className='flex justify-center items-center h-4 w-8' onClick={handleTimerToggle}> Pause </div>}
          {(state.matches('idle') || state.matches('idle')) && <div className='flex justify-center items-center h-4 w-8' onClick={handleTimerToggle}> Play </div>}
          {state.matches('finished') && <div className='flex justify-center items-center h-4 w-8' onClick={handleNextBlock}> Next </div>}
        </div>
      </div>
      {block.length > 0 && block.map(({ id, type, duration }: any) => {
        return (
          <div
            key={id}
            draggable
            className='flex justify-between items-center h-12 auto m-2 p-4 space-x-2 bg-white rounded-md'
            onDragStart={(event) => onDragStart(event, id)}
            onDragOver={(event) => onDragOver(event, id)}
            onDrop={(event) => onDragDrop(event, id)}
          >
            <div>{type}</div>
            <div>{duration} </div>
          </div>
        )
      })}
      <div className="flex flex-col bg-slate-400">
        <input value={input} onChange={handleInputChange} />
        <select name="type" id="block" onChange={handleSelectChange}>
          <option value="work">Work</option>
          <option value="Rest">Rest</option>
          <option value="custom">custom input</option>
        </select>
      </div>
      <div className='flex justify-center items-center h-8 w-auto px-2 my-4 bg-slate-100 rounded-md' onClick={handleAddBlock}> 
        <p>Create New Block</p>
      </div>
      <div className='flex flex-col w-full m-4 bg-slate-200 rounded-md'>
        {history.map((ele: any) => {
          return (
            <div key={'history' + ele.id + Math.random() * 1000} className="flex justify-between py-1 px-4">
              <div>{ele.type} </div>
              <div>{ele.duration} </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}