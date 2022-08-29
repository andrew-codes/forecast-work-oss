import React, { useCallback } from "react"
import { Form, Field, useForm, useValidationRule, FormType } from "../Form"
import FilePicker from "../FormFields/FilePicker"
import ConfigurationFormProps from "./ConfigurationFormProps"

const UploadConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const [submit, reset, form] = useForm(id)
  const handleSubmit = useCallback<(evt: React.SyntheticEvent, form: FormType) => void>((evt, form) => {
    onSubmit(evt, form)
  }, [onSubmit],
  )
  const handleReset = useCallback(() => { }, [])

  const validateRequired = useValidationRule<string>(
    "Required",
    (field, fields) => field.value !== "",
    "change",
  )

  return (
    <Form id={id} onSubmit={handleSubmit} onReset={handleReset}>
      <fieldset>
        <legend>
          <h3>Historical Data</h3>
        </legend>
        <Field<string, { accept: string }>
          fullWidth
          accept="text/csv"
          as={FilePicker}
          defaultValue=""
          label="CSV File"
          name="filePath"
          validate={validateRequired}
        />
      </fieldset>
      <button type="button" disabled={!form.canSubmit} onClick={submit}>Start</button>
    </Form>
  )
}

export default UploadConfiguration
