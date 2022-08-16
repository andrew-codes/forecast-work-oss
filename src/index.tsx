import React, { useState } from "react"
import * as ReactDOM from "react-dom"

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>{count}</h1>
      <button onClick={() => setCount((count) => count + 1)}>Count</button>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
)
