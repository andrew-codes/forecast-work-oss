import { isEmpty, keyBy } from "lodash"
import { get } from "lodash/fp"
import React, {
  EventHandler,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { FieldsType, FieldType, FormType, ValidityType } from "./Form"
import FormsContext from "./FormsContext"

type UseFormType = (
  id: string,
) => [EventHandler<SyntheticEvent>, EventHandler<SyntheticEvent>, FormType]

const computeCanSubmit = <TValue,>(fields: FieldsType): boolean =>
  !isEmpty(fields) &&
  (Object.values(fields).reduce((acc, field: FieldType<TValue>) => {
    return acc && field.validity === ValidityType.valid
  }, true) as boolean)

const useForm: UseFormType = (id) => {
  const formsContext = useContext(FormsContext)

  const fields = formsContext.getValues(id)
  const validations = formsContext.getValidations(id)
  const [canSubmit, setCanSubmit] = useState(computeCanSubmit(fields))
  useEffect(() => {
    setCanSubmit(computeCanSubmit(fields))
  }, [fields])

  const revalidate = useCallback(() => {
    const newFields = Object.values(fields).map((field) =>
      validations[field.name](field, fields),
    )
    const newFormFields = keyBy<FieldType<any>>(newFields, get("name"))
    formsContext.setValues(id, newFormFields)
  }, [fields, validations])

  const form = { canSubmit, fields, revalidate }
  const { reset, submit: handleSubmit } = formsContext.getHandlers(id)
  const submit = useCallback(
    (evt) => {
      if (!canSubmit) {
        return
      }

      handleSubmit(evt, form)
    },
    [canSubmit, form, handleSubmit],
  )

  return [submit, reset, form]
}

export { useForm }
