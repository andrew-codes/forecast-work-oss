import React, {
  EventHandler,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
} from "react"
import styled from "styled-components"
import { isEmpty, merge } from "lodash"
import { FormValueType, ValidityType } from "./Form"
import FormContext from "./FormContext"
import FormsContext from "./FormsContext"
import { ValidationRuleType } from "./useValidationRule"

interface AlignedProps {
  fullWidth: boolean
}
const Aligned = styled.div<AlignedProps>`
  display: flex;
  flex: 1;
  align-self: flex-start;
  margin: 4px;
  width: ${({ fullWidth }) => (fullWidth ? `calc(100%)` : undefined)};
  height: 1.25rem;
`
const FieldLabel = styled(Aligned)`
  color: #6c798f;
`
const ErrorMessage = styled(Aligned)`
  color: pink;
`
const RequiredMark = styled.span`
  color: lightblue !important;
`
const Required = () => <RequiredMark>*</RequiredMark>

type FieldEventHandlerType = (evt: SyntheticEvent, value: any) => void

type FormFieldComponentProps = {
  onBlur: FieldEventHandlerType
  onChange: FieldEventHandlerType
  value: any
  touched?: boolean
  valid?: ValidityType
}

interface FieldPropTypes {
  as: React.FC<FormFieldComponentProps>
  defaultValue?: string
  fullWidth?: boolean
  hintText?: string | ReactNode
  label: string
  name: string
  onBlur?: EventHandler<SyntheticEvent>
  onChange?: EventHandler<SyntheticEvent>
  validate?: ValidationRuleType
}

const generateDefaultValue: (
  name: string,
  defaultValue: string,
  hasValidation: boolean,
) => FormValueType = (name, defaultValue, hasValidation) => ({
  name,
  value: defaultValue,
  touched: false,
  validity:
    hasValidation && isEmpty(defaultValue)
      ? ValidityType.invalid
      : ValidityType.unknonwn,
  error: null,
})

const Field: React.FC<FieldPropTypes> = ({
  as,
  defaultValue,
  name,
  fullWidth,
  label,
  onBlur = (evt) => {},
  onChange = (evt) => {},
  validate,
  ...rest
}) => {
  const { getValues, setValue } = useContext(FormsContext)
  const id = useContext(FormContext)
  const values = getValues(id)
  const value =
    (values[name] as FormValueType) ||
    generateDefaultValue(name, defaultValue ?? "", !!validate)

  useEffect(() => {
    setValue(id, value)
  }, [id, setValue, value])

  const handleBlur = useCallback<EventHandler<SyntheticEvent>>(
    (evt) => {
      const newValue = merge({}, value, { touched: true })
      let error = null
      if (!!validate) {
        error = validate(newValue, values, "blur")
      }
      newValue.error = error
      newValue.validity =
        error === null ? ValidityType.valid : ValidityType.invalid
      setValue(id, newValue)
      onBlur(evt)
    },
    [setValue, onBlur, id, value],
  )

  const handleChange = useCallback<FieldEventHandlerType>(
    (evt, v) => {
      const newValue: FormValueType = merge({}, value, {
        value: v,
      })
      let error = null
      if (!!validate) {
        error = validate(newValue, values, "change")
      }
      newValue.error = error
      newValue.validity =
        error === null ? ValidityType.valid : ValidityType.invalid
      setValue(id, newValue)
      onChange(evt)
    },
    [value, setValue, onChange, id],
  )

  const FormField = as

  return (
    <label>
      <FieldLabel fullWidth={fullWidth}>
        {label} {!!validate && <Required />}
      </FieldLabel>
      <FormField
        {...rest}
        touched={value.touched}
        valid={value.validity}
        value={value.value}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      <ErrorMessage fullWidth={fullWidth}>{value.error}</ErrorMessage>
    </label>
  )
}

export { Field }
export type { FormFieldComponentProps }
