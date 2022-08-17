import React, {
  EventHandler,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { isEmpty } from "lodash"
import { FormProvider } from "./FormProvider"
import FormsContext from "./FormsContext"

enum ValidityType {
  valid,
  invalid,
  unknonwn,
}
type FormErrorType = string | ReactNode | null
type FormValueType = {
  name: string
  value: string
  touched: boolean
  validity: ValidityType
  error: FormErrorType
}
type FormValuesType = Record<string, FormValueType>
type FormType = {
  canSubmit: boolean
  fields: FormValuesType
}

type FormProps = {
  children: React.ReactNode
  id: string
  onReset: EventHandler<SyntheticEvent>
  onSubmit: EventHandler<SyntheticEvent>
}
const Form: React.FC<FormProps> = ({ children, id, onReset, onSubmit }) => {
  const formsContext = useContext(FormsContext)

  useEffect(() => {
    formsContext.registerForm(id)
  }, [id])

  const handleReset = useCallback<EventHandler<SyntheticEvent>>(
    (evt) => {
      formsContext.setValues(id, {})
      onReset(evt)
    },
    [formsContext.forms[id], onReset],
  )

  const handleSubmit = useCallback<EventHandler<SyntheticEvent>>(
    (evt) => {
      const form: FormValuesType = formsContext.forms[id] ?? {}
      const values = Object.values(form)
      const isValid =
        !isEmpty(values) &&
        values.reduce<boolean>(
          (acc, value) => acc && value.validity !== ValidityType.invalid,
          true,
        )
      if (!isValid) {
        return
      }
      onSubmit(evt)
    },
    [formsContext.forms[id], onSubmit],
  )

  const eventHandlers = useMemo(
    () => ({
      reset: handleReset,
      submit: handleSubmit,
    }),
    [handleReset, handleSubmit],
  )

  useEffect(() => {
    formsContext.registerEventHandlers(id, eventHandlers)
  }, [id, eventHandlers])

  return (
    <FormProvider id={id}>
      <form>{children}</form>
    </FormProvider>
  )
}

export { Form, ValidityType }
export type { FormType, FormValuesType, FormErrorType, FormValueType }
