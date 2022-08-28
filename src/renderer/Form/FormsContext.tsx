import { createContext, EventHandler, SyntheticEvent } from "react"
import { noop } from "lodash"
import type { FieldType, FieldsType, FormType } from "."

type FormsContextType = {
  eventHandlers: Record<
    string,
    {
      reset?: EventHandler<SyntheticEvent>
      submit?: EventHandler<SyntheticEvent>
    }
  >
  forms: Record<string, FieldsType>
  getHandlers: (id: string) => {
    reset: EventHandler<SyntheticEvent>
    submit: (evt: SyntheticEvent, form: FormType) => void
  }
  getValues: (id: string) => FieldsType
  registerEventHandlers: (
    id: string,
    handlers: {
      reset: EventHandler<SyntheticEvent>
      submit: (evt: SyntheticEvent, form: FormType) => void
    },
  ) => void
  registerForm: (id: string) => void
  setValue: (id: string, value: FieldType<any>) => void
  setValues: (id: string, values: FieldsType) => void
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
