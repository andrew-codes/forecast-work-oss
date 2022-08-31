import Button from "@atlaskit/button"
import React, { useCallback, useState } from "react"
import { Form, Field, useForm, useValidationRule, ValidityType } from "../Form"
import PasswordField from "../FormFields/PasswordField"
import TextField from "../FormFields/TextField"
import ConfigurationFormProps from "./ConfigurationFormProps"

const AdoConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const [submit, reset, form] = useForm(id)

  const validateRequired = useValidationRule<string>(
    "Required",
    (field, fields) => field.value != "",
  )

  const validateTeamMembers = useValidationRule<string>(
    "Two or more team members are required",
    (field, fields) => {
      const members = field.value.split(",")
      return (
        members.length > 1 &&
        members.reduce((acc, member) => acc && member !== "", true)
      )
    },
  )

  const [users, setUsers] = useState([])
  console.log(users)
  const queryTeamMembers = useCallback(
    (evt) => {
      if (
        form.fields.orgName.validity !== ValidityType.valid ||
        form.fields.projectName.validity !== ValidityType.valid ||
        form.fields.adoUsername.validity !== ValidityType.valid ||
        form.fields.adoPat.validity !== ValidityType.valid
      ) {
        return
      }
    },
    [form],
  )

  const handleSubmit = React.useCallback<(evt: React.SyntheticEvent) => void>(
    (evt) => onSubmit(evt, form),
    [form],
  )
  const handleReset = React.useCallback(() => {}, [])

  return (
    <Form id={id} onSubmit={handleSubmit} onReset={handleReset}>
      <Field
        fullWidth
        as={TextField}
        defaultValue=""
        label="Organization Name"
        name="orgName"
        onBlur={queryTeamMembers}
        validate={validateRequired}
      />
      <Field
        fullWidth
        as={TextField}
        defaultValue=""
        label="Project Name"
        name="projectName"
        onBlur={queryTeamMembers}
        validate={validateRequired}
      />
      <Field
        fullWidth
        as={TextField}
        defaultValue=""
        label="Username"
        name="adoUsername"
        onBlur={queryTeamMembers}
        validate={validateRequired}
      />
      <Field
        fullWidth
        as={PasswordField}
        defaultValue=""
        label="Personal Access Token"
        name="adoPat"
        onBlur={queryTeamMembers}
        validate={validateRequired}
      />
      <Field
        fullWidth
        as={TextField}
        defaultValue=""
        label="Team Member IDs"
        name="teamMemberIds"
        validate={validateTeamMembers}
      />
      <br />
      <Button
        appearance="primary"
        isDisabled={!form.canSubmit}
        onClick={submit}
      >
        Start
      </Button>
    </Form>
  )
}

export default AdoConfiguration
