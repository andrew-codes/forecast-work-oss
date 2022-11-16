import { createContext, EventHandler, SyntheticEvent } from "react"
import { noop } from "lodash"
import type { FieldType, FieldsType, FormType } from "."
import { ValidationRuleType } from "./useValidationRule"

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
  getValidations: <TValue>(
    id: string,
  ) => Record<
    string,
    (field: FieldType<TValue>, fields: FieldsType) => FieldType<TValue>
  >
  registerEventHandlers: (
    id: string,
    handlers: {
      reset: EventHandler<SyntheticEvent>
      submit: (evt: SyntheticEvent, form: FormType) => void
    },
  ) => void
  registerForm: (id: string) => void
  registerRevalidate: <TValue>(
    id: string,
    name: string,
    validate: (field: FieldType<TValue>, FieldsType) => FieldType<TValue>,
  ) => void
  setValue: (id: string, value: FieldType<any>) => void
  setValues: (id: string, values: FieldsType) => void
}

const FormsContext = createContext<FormsContextType>({
  eventHandlers: {},
  forms: {},
  getHandlers: noop,
  getValues: noop,
  getValidations: noop,
  registerEventHandlers: noop,
  registerForm: noop,
  registerRevalidate: noop,
  setValue: noop,
  setValues: noop,
})

export default FormsContext
export type { FormsContextType }
