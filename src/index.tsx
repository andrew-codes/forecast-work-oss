import { PageLayout } from "@atlaskit/page-layout"
import React from "react"
import * as ReactDOM from "react-dom"
import App from "./App"
import { FormsProvider } from "./Form"
import GlobalStyles from "./GlobalStyles"

ReactDOM.render(
  <React.StrictMode>
    <FormsProvider>
      <>
        <GlobalStyles />
        <PageLayout>
          <App />
        </PageLayout>
      </>
    </FormsProvider>
  </React.StrictMode>,
  document.getElementById("root"),
)
