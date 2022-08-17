import { createContext, EventHandler, SyntheticEvent } from "react"
import { noop } from "lodash"
import type { FormValueType, FormValuesType } from "."

type FormsContextType = {
  eventHandlers: Record<
    string,
    {
      reset?: EventHandler<SyntheticEvent>
      submit?: EventHandler<SyntheticEvent>
    }
  >
  forms: Record<string, FormValuesType>
  getHandlers: (id: string) => {
    reset: EventHandler<SyntheticEvent>
    submit: EventHandler<SyntheticEvent>
  }
  getValues: (id: string) => FormValuesType
  registerEventHandlers: (
    id: string,
    handlers: {
      reset: EventHandler<SyntheticEvent>
      submit: EventHandler<SyntheticEvent>
    },
  ) => void
  registerForm: (id: string) => void
  setValue: (id: string, value: FormValueType) => void
  setValues: (id: string, values: FormValuesType) => void
}

const FormsContext = createContext<FormsContextType>({
  eventHandlers: {},
  forms: {},
  getHandlers: noop,
  getValues: noop,
  registerEventHandlers: noop,
  registerForm: noop,
  setValue: noop,
  setValues: noop,
})

export default FormsContext
export type { FormsContextType }
