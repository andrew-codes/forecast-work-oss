import React, {
  EventHandler,
  ReactNode,
  SyntheticEvent,
  useContext,
  useEffect,
} from "react"
import styled from "styled-components"
import { FormProvider } from "./FormProvider"
import FormsContext from "./FormsContext"

const StyledForm = styled.form`
  display: flex;
  flex: 1;
`

enum ValidityType {
  valid,
  invalid,
  unknonwn,
}
type FormErrorType = string | ReactNode | null
type FieldType<TValue> = {
  name: string
  value: TValue
  touched: boolean
  validity: ValidityType
  error: FormErrorType
}
type FieldsType = Record<string, FieldType<any>>
type FormType = {
  canSubmit: boolean
  fields: FieldsType
}

type FormProps = {
  children: React.ReactNode
  id: string
  onReset: EventHandler<SyntheticEvent>
  onSubmit: (evt: SyntheticEvent, form: FormType) => void
}
const Form: React.FC<FormProps> = ({ children, id, onReset, onSubmit }) => {
  const { registerForm, registerEventHandlers } = useContext(FormsContext)

  useEffect(() => {
    registerForm(id)
  }, [registerForm, id])

  useEffect(() => {
    registerEventHandlers(id, {
      reset: onReset,
      submit: onSubmit,
    })
  }, [id, onReset, registerEventHandlers, onSubmit])

  return (
    <FormProvider id={id}>
      <StyledForm data-test={id}>{children}</StyledForm>
    </FormProvider>
  )
}

export { Form, ValidityType }
export type { FormType, FieldsType, FormErrorType, FieldType }
