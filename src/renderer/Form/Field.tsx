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
import { FieldType, ValidityType } from "./Form"
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
  color: var(--text-color);
`
const ErrorMessage = styled(Aligned)`
  color: pink;
`
const RequiredMark = styled.span`
  color: lightblue !important;
`
const Required = () => <RequiredMark>*</RequiredMark>

type FieldEventHandlerType<TValue> = (
  evt: SyntheticEvent,
  value: TValue,
) => void

type FormFieldComponentProps<TValue> = {
  onBlur: React.EventHandler<React.SyntheticEvent>
  onChange: FieldEventHandlerType<TValue>
  value: TValue
  touched?: boolean
  valid?: ValidityType
}

interface FieldPropTypes<TValue> {
  as: (props: FormFieldComponentProps<TValue>) => JSX.Element
  defaultValue?: TValue
  fullWidth?: boolean
  hintText?: string | ReactNode
  label: string
  name: string
  onBlur?: EventHandler<SyntheticEvent>
  onChange?: EventHandler<SyntheticEvent>
  validate?: ValidationRuleType<TValue>
}

const generateDefaultValue: <TValue>(
  name: string,
  defaultValue: TValue,
  hasValidation: boolean,
) => FieldType<TValue> = (name, defaultValue, hasValidation) => ({
  name,
  value: defaultValue,
  touched: false,
  validity:
    hasValidation && isEmpty(defaultValue)
      ? ValidityType.invalid
      : ValidityType.unknonwn,
  error: null,
})

const Field = <TValue extends any, TRest extends object>({
  as,
  defaultValue,
  name,
  fullWidth,
  label,
  onBlur = (evt) => { },
  onChange = (evt) => { },
  validate,
  ...rest
}: FieldPropTypes<TValue> & TRest): JSX.Element => {
  const { getValues, setValue } = useContext(FormsContext)
  const id = useContext(FormContext)
  const values = getValues(id)
  const field =
    (values[name] as FieldType<TValue>) ??
    generateDefaultValue(name, defaultValue, !!validate)

  const handleBlur = useCallback<EventHandler<SyntheticEvent>>(
    (evt) => {
      const newValue = merge({}, field, { touched: true })
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
    [setValue, onBlur, id, field],
  )

  const handleChange = useCallback<FieldEventHandlerType<TValue>>(
    (evt, v) => {
      const newValue: FieldType<TValue> = merge({}, field, {
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
    [field, setValue, onChange, id],
  )

  const FormField = as

  return (
    <label data-test={name} data-component="Field">
      <FieldLabel fullWidth={fullWidth}>
        {label} {!!validate && <Required />}
      </FieldLabel>
      <FormField
        {...rest}
        touched={field.touched}
        valid={field.validity}
        value={field.value}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      <ErrorMessage fullWidth={fullWidth}>{field.error}</ErrorMessage>
    </label>
  )
}

export { Field }
export type { FormFieldComponentProps }
