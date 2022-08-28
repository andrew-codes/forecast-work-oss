import { isEmpty } from "lodash"
import React, { useEffect, useCallback } from "react"
import { Throughput } from "src/main/dataManiuplation"
import { Form, Field, useForm, useValidationRule } from "../Form"
import FilePicker from "../FormFields/FilePicker"

const UploadConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const validateRequired = useValidationRule<string>(
    "Required",
    (field, fields) => field.value !== "",
    "change",
  )

  const handleSubmit = useCallback<(evt: React.SyntheticEvent) => void>((evt) => {
    console.log(form.fields.filePath)
    // onSubmit,
  },
    [onSubmit],
  )
  const handleReset = useCallback(() => { }, [])

  const [submit, reset, form] = useForm(id)

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
