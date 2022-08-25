import { isEmpty } from "lodash"
import React, { useEffect, useCallback } from "react"
import { Throughput } from "src/main/dataManiuplation"
import { Form, Field, useForm, useValidationRule } from "../Form"
import FilePicker from "../FormFields/FilePicker"

const UploadConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const validateRequired = useValidationRule<{ throughput: Throughput }>(
    "Required",
    (field, fields) => !isEmpty(field.value.throughput),
    "change",
  )

  const handleSubmit = useCallback<(evt: React.SyntheticEvent) => void>(
    onSubmit,
    [onSubmit],
  )
  const handleReset = useCallback(() => {}, [])

  const [submit, reset, form] = useForm(id)
  useEffect(() => {
    if (form.canSubmit) {
      submit(null)
    }
  }, [form, submit])

  return (
    <Form id={id} onSubmit={handleSubmit} onReset={handleReset}>
      <fieldset>
        <legend>
          <h3>Throughput via File</h3>
        </legend>
        <Field<{ throughput: Throughput }>
          fullWidth
          as={FilePicker}
          defaultValue={{ throughput: [] }}
          label="CSV File"
          name="data"
          validate={validateRequired}
        />
      </fieldset>
    </Form>
  )
}

export default UploadConfiguration
