import * as React from "react"
import { Content, LeftSidebar, Main, PageLayout } from "@atlaskit/page-layout"
import {
  NavigationContent,
  CustomItem,
  Section,
  SideNavigation,
} from "@atlaskit/side-navigation"
import styled from "styled-components"
import GlobalStyles from "./GlobalStyles"
import Configuration from "./Configuration"

const Sidebar = styled.div`
  height: 100%;
  --ds-surface: var(--side-bar-color);
`
const NavBorder = styled(Sidebar)`
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
`

const MainContent = styled.div`
  padding: 40px;
`

const App = () => (
  <>
    <GlobalStyles />
    <PageLayout>
      <Content>
        <NavBorder>
          <LeftSidebar width={350}>
            <SideNavigation label="Configuration">
              <NavLayout>
                <NavigationContent>
                  <Configuration />
                </NavigationContent>
              </NavLayout>
            </SideNavigation>
          </LeftSidebar>
        </NavBorder>
        <Main>
          <MainContent></MainContent>
        </Main>
      </Content>
    </PageLayout>
  </>
)

export default App
