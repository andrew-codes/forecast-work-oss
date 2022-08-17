import * as React from "react"
import {
  Content,
  LeftSidebar,
  Main,
  usePageLayoutResize,
} from "@atlaskit/page-layout"
import { NavigationContent, SideNavigation } from "@atlaskit/side-navigation"
import styled from "styled-components"
import { Form, Field, useForm } from "./Form"
import TextField from "./FormFields/TextField"
import { ValidationRuleType } from "./Form/useValidationRule"

const NavBorder = styled.div`
  --ds-surface: var(--side-bar-color);
  height: 100vh;
  border-right: 1px solid var(--border-color);
`

const NavLayout = styled.div`
  height: 100% !important;
  flex-direction: column;
  display: flex;
  background: var(--side-bar-color);
  > * {
    height: unset !important;
  }
  > *:last-child {
    flex: 1;
  }
  padding: 0 24px 24px;
`

const MainContent = styled.div`
  padding: 40px;
`

const App = () => {
  const configurationFormId = "configuration"
  const [submitConfiguration, resetConfiguration, configurationForm] =
    useForm(configurationFormId)

  const { collapseLeftSidebar } = usePageLayoutResize()

  const validateRequired = React.useCallback<ValidationRuleType>(
    (value, values, changeType) => {
      if (!/^.+$/.test(value.value)) {
        return "Required"
      }

      return null
    },
    [],
  )

  const handleSubmit = React.useCallback(() => {
    collapseLeftSidebar()
  }, [configurationForm])

  const handleReset = React.useCallback(() => {}, [configurationForm])

  return (
    <Content>
      <NavBorder>
        <LeftSidebar width={350}>
          <SideNavigation label="Configuration">
            <NavLayout>
              <NavigationContent>
                <Form
                  id={configurationFormId}
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                >
                  <h2>Configuration</h2>
                  <fieldset>
                    <legend>ADO Information</legend>
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
                  </fieldset>
                  <br />
                  <fieldset>
                    <legend>Inputs</legend>
                    <Field
                      fullWidth
                      as={TextField}
                      label="Number of days of history"
                      name="numberOfDays"
                      defaultValue="90"
                      validate={validateRequired}
                    />
                  </fieldset>
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
                </Form>
              </NavigationContent>
            </NavLayout>
          </SideNavigation>
        </LeftSidebar>
      </NavBorder>
      <Main>
        <MainContent>
          <h1>ADO Forecasting Tool</h1>
        </MainContent>
      </Main>
    </Content>
  )
}

export default App
