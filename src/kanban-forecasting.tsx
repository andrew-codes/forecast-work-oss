import * as React from "react"
import { render } from "react-dom"
import Forecasting from "./containers/forecasting"
import Vss from "./vss/Vss"

const rootEl = document.querySelector("#root")
render(
  <Vss>
    <Forecasting />
  </Vss>,
  rootEl,
)
