import React, { useState } from "react"
import {
  Content,
  LeftSidebar,
  Main,
  usePageLayoutResize,
} from "@atlaskit/page-layout"
import { NavigationContent, SideNavigation } from "@atlaskit/side-navigation"
import styled from "styled-components"
// import AdoConfigurationForm from "./configuration/AdoConfigurationForm"
import UploadConfiguration from "./configuration/UploadConfiguration"
import { useForm } from "./Form"

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
  const { collapseLeftSidebar } = usePageLayoutResize()
  const [, , form] = useForm("uploadConfiguration")
  const [data, setData] = useState({ throughput: [] })
  const handleSubmit = React.useCallback(() => {
    collapseLeftSidebar()
    console.log(form)
    // setData(form.fields.data.value)
  }, [collapseLeftSidebar])

  return (
    <Content>
      <NavBorder>
        <LeftSidebar width={350}>
          <SideNavigation label="Configuration">
            <NavLayout>
              <NavigationContent>
                <h2>Configuration</h2>
                <UploadConfiguration
                  id="uploadConfiguration"
                  onSubmit={handleSubmit}
                />
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
