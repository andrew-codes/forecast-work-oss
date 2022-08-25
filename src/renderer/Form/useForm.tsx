import { isEmpty } from "lodash"
import { EventHandler, SyntheticEvent, useContext } from "react"
import { FormType, ValidityType } from "./Form"
import FormsContext from "./FormsContext"

type UseFormType = (
  id: string,
) => [EventHandler<SyntheticEvent>, EventHandler<SyntheticEvent>, FormType]

const useForm: UseFormType = (id) => {
  const formsContext = useContext(FormsContext)
  const { reset, submit } = formsContext.getHandlers(id)

  const fields = formsContext.getValues(id)
  const canSubmit =
    !isEmpty(fields) &&
    Object.values(fields).reduce((acc, field) => {
      return acc && field.validity !== ValidityType.invalid
    }, true)
  const form = { canSubmit, fields }

  return [submit, reset, form]
}

export { useForm }
