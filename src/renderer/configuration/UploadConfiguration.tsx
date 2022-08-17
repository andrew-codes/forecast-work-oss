import React from "react"
import { Form, Field, useForm, useValidationRule } from "../Form"
import FilePicker from "../FormFields/FilePicker"

const UploadConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const validateRequired = useValidationRule(
    "Required",
    (value, values) => !/^.+$/.test(value.value),
  )

  const [submit, reset, form] = useForm(id)
  const handleSubmit = React.useCallback<(evt: React.SyntheticEvent) => void>(
    (evt) => onSubmit(evt),
    [onSubmit],
  )
  const handleReset = React.useCallback(() => {}, [])

  return (
    <Form id={id} onSubmit={handleSubmit} onReset={handleReset}>
      <fieldset>
        <legend>
          <h3>Throughput via File</h3>
        </legend>
        <Field
          fullWidth
          as={FilePicker}
          label="CSV File"
          name="orgName"
          validate={validateRequired}
        />
      </fieldset>
    </Form>
  )
}

export default UploadConfiguration
