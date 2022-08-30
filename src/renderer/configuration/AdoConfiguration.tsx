import Button from '@atlaskit/button'
import React from "react"
import { Form, Field, useForm, useValidationRule } from "../Form"
import PasswordField from '../FormFields/PasswordField'
import TextField from "../FormFields/TextField"
import ConfigurationFormProps from "./ConfigurationFormProps"

const AdoConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const [submit, reset, form] =
    useForm(id)

  const validateRequired = useValidationRule<string>(
    "Required",
    (field, fields) => field.value !== "",
  )

  const handleSubmit = React.useCallback<(evt: React.SyntheticEvent) => void>(
    (evt) => onSubmit(evt, form),
    [form],
  )
  const handleReset = React.useCallback(() => { }, [])

  return (
    <Form id={id} onSubmit={handleSubmit} onReset={handleReset}>
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
        as={PasswordField}
        label="Personal Access Token"
        name="adoPat"
        validate={validateRequired}
      />
      <Field
        fullWidth
        as={TextField}
        label="Team Member IDs"
        name="teamMemberIds"
        validate={validateRequired}
      />
      <br />
      <Button
        appearance='primary'
        isDisabled={!form.canSubmit}
        onClick={submit}
      >
        Start
      </Button>
    </Form>
  )
}

export default AdoConfiguration
