import React, {
  EventHandler,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
} from "react"
import styled from "styled-components"
import { merge } from "lodash"
import { FieldsType, FieldType, ValidityType } from "./Form"
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
  width: ${({ fullWidth }) => (fullWidth ? `calc(100%)` : undefined)};
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
  name?: string
  onBlur: React.EventHandler<React.SyntheticEvent>
  onChange: FieldEventHandlerType<TValue>
  touched?: boolean
  valid?: ValidityType
  value: TValue
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
  validity: hasValidation ? ValidityType.unknonwn : ValidityType.valid,
  error: null,
})

const revalidate: <TValue>(
  validate: ValidationRuleType<TValue>,
) => (field: FieldType<TValue>, values: FieldsType) => FieldType<TValue> =
  (validate) => (field, values) => {
    if (!field) {
      return
    }
    if (!!validate) {
      const error = validate(field, values, "any")
      field.validity = !!error ? ValidityType.invalid : ValidityType.valid
    } else {
      field.validity = ValidityType.valid
    }

    return field
  }

const Field = <TValue extends any, TRest extends object>({
  as,
  defaultValue,
  name,
  fullWidth,
  label,
  onBlur = (evt) => {},
  onChange = (evt) => {},
  validate,
  ...rest
}: FieldPropTypes<TValue> & TRest): JSX.Element => {
  const { getValues, setValue, registerRevalidate } = useContext(FormsContext)
  const id = useContext(FormContext)
  const values = getValues(id)
  const field =
    (values[name] as FieldType<TValue>) ??
    generateDefaultValue(name, defaultValue, !!validate)

  if (!values[name] && !!validate && !!defaultValue) {
    const error = validate(field, values, "any")
    field.error = error
    field.validity = error === null ? ValidityType.valid : ValidityType.invalid
  }

  useEffect(() => {
    setValue(id, field)
  }, [])

  useEffect(() => {
    registerRevalidate(id, name, revalidate(validate))
  }, [id, name, validate])

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
      const newValue: FieldType<TValue> = merge({}, field)
      newValue.value = v
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
