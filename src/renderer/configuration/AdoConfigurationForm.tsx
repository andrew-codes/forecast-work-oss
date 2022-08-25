import React from "react"
import { Form, Field, useForm, useValidationRule } from "../Form"
import TextField from "../FormFields/TextField"

const AdoConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const [submitConfiguration, resetConfiguration, configurationForm] =
    useForm(id)

  const validateRequired = useValidationRule(
    "Required",
    (field, fields) => !/^.+$/.test(field.value),
  )

  const handleSubmit = React.useCallback<(evt: React.SyntheticEvent) => void>(
    (evt) => onSubmit(evt),
    [configurationForm],
  )
  const handleReset = React.useCallback(() => {}, [configurationForm])

  return (
    <Form id={id} onSubmit={handleSubmit} onReset={handleReset}>
      <fieldset>
        <legend>
          <h3>ADO</h3>
        </legend>
        <Field
          fullWidth
          as={TextField}
          label="Organization Name"
          name="orgName"
          validate={validateRequired}
        />
        <Field
          fullWidth
          as={TextField}
          label="Project Name"
          name="projectName"
          validate={validateRequired}
        />
        <Field
          fullWidth
          as={TextField}
          label="Personal Access Token"
          name="adoPat"
          validate={validateRequired}
        />
        <br />
        <button
          disabled={!configurationForm.canSubmit}
          onClick={submitConfiguration}
          type="button"
        >
          Save
        </button>
        <button
          disabled={!configurationForm.canSubmit}
          onClick={resetConfiguration}
          type="button"
        >
          Reset
        </button>
      </fieldset>
    </Form>
  )
}

export default AdoConfiguration
