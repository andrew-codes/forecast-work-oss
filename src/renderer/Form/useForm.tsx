import { isEmpty } from "lodash"
import React, { EventHandler, SyntheticEvent, useCallback, useContext, useEffect } from "react"
import { FormType, ValidityType } from "./Form"
import FormsContext from "./FormsContext"

type UseFormType = (
  id: string,
) => [EventHandler<SyntheticEvent>, EventHandler<SyntheticEvent>, FormType]

const useForm: UseFormType = (id) => {
  const formsContext = useContext(FormsContext)
  const { reset, submit: handleSubmit } = formsContext.getHandlers(id)

  const fields = formsContext.getValues(id)
  const canSubmit =
    !isEmpty(fields) &&
    Object.values(fields).reduce((acc, field) => {
      return acc && field.validity !== ValidityType.invalid
    }, true)
  const form = { canSubmit, fields }
  const submit = useCallback((evt) => {
    if (!canSubmit) {
      return
    }

    handleSubmit(evt, form)
  }, [canSubmit, form, handleSubmit])


  return [submit, reset, form]
}

export { useForm }
