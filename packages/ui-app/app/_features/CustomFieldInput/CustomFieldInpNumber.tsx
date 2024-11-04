import { useEffect, useRef, useState } from "react"
import { useCustomFieldInputContext } from "./context"

export default function CustomFieldInpNumber({ value, config }: { value: string, config: string }) {
  console.log(config)
  const [enableEdit, setEnableEdit] = useState(false)
  const { onChange } = useCustomFieldInputContext()
  const [val, setVal] = useState(value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const inpElem = ref.current
    if (enableEdit && inpElem) {

      inpElem.focus()
    }
  }, [enableEdit, ref])

  return <div className="cf-input-container">
    {enableEdit ?
      <input ref={ref} className="cf-edit"
        onBlur={ev => {
          setEnableEdit(false)
          const inpVal = ev.target.value
          if (inpVal === val) return
          setVal(inpVal)
          onChange(inpVal)
        }}
        defaultValue={val || ''} />
      :
      <div className="cf-display" onClick={ev => setEnableEdit(true)}>{val}</div>
    }
  </div>
}
