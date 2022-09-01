import Button from "@atlaskit/button"
import { isEmpty } from "lodash"
import React, { useCallback, useState } from "react"
import styled from "styled-components"
import { Form, Field, useForm, useValidationRule, ValidityType } from "../Form"
import PasswordField from "../FormFields/PasswordField"
import SelectField from "../FormFields/SelectField"
import TextField from "../FormFields/TextField"
import VerticalSpacedGroup from "../VerticalSpacedGroup"
import ConfigurationFormProps from "./ConfigurationFormProps"

const StyledButton = styled(Button)`
  position: sticky;
`

const Spacer = styled.div`
  flex: 1;
`

const AdoConfiguration: React.FC<ConfigurationFormProps> = ({
  id,
  onSubmit,
}) => {
  const [submit, reset, form] = useForm(id)

  const validateRequired = useValidationRule<string>(
    "Required",
    (field, fields) => field.value != "",
  )

  const validateTeamMembers = useValidationRule<
    { label: string; value: string }[]
  >("Two or more team members are required", (field, fields) => {
    return (
      field.value.length > 1 &&
      field.value.reduce((acc, option) => acc && option.value !== "", true)
    )
  })

  const [users, setUsers] = useState([])
  const queryTeamMembers = useCallback(
    (evt) => {
      if (
        !isEmpty(users) ||
        form.fields.orgName.validity !== ValidityType.valid ||
        form.fields.projectName.validity !== ValidityType.valid ||
        form.fields.teamName.validity !== ValidityType.valid ||
        form.fields.adoUsername.validity !== ValidityType.valid ||
        form.fields.adoPat.validity !== ValidityType.valid
      ) {
        return
      }

      electron
        .fetchAdoUsers({
          organizationName: form.fields.orgName.value,
          projectName: form.fields.projectName.value,
          accessToken: form.fields.adoPat.value,
          teamId: form.fields.teamName.value,
          username: form.fields.adoUsername.value,
        })
        .then((results) => {
          setUsers(results)
        })
        .catch(console.error)
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
      <VerticalSpacedGroup spaced={24}>
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
          label="Team Name"
          name="teamName"
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
        <Field<
          { label: string; value: string }[],
          {
            isMulti: boolean
            placeholder: string
            options: { label: string; value: string }[]
          }
        >
          fullWidth
          isMulti
          options={users.map((user) => ({
            label: user.displayName,
            value: user.id,
          }))}
          as={SelectField}
          defaultValue={[]}
          label="Team Members"
          name="teamMemberIds"
          placeholder="Choose users"
          validate={validateTeamMembers}
        />
        <Spacer />
        <StyledButton
          appearance="primary"
          isDisabled={!form.canSubmit}
          onClick={submit}
        >
          Start
        </StyledButton>
      </VerticalSpacedGroup>
    </Form>
  )
}

export default AdoConfiguration
