import { createGlobalStyle } from "styled-components"

const GlobalStyles = createGlobalStyle`

* {
  box-sizing: border-box;
}

body {
  --dark-gray: rgb(39,40,38);
  --dark-slate-gray: #0d1117;
  --side-bar-color: #161b22;
  --button-background-color: #21262d;
  --off-white: rgba(240,246,252,0.1);
  --border-color: rgba(240,246,252,0.1);
  --ds-surface: var(--dark-slate-gray);
  --text-color: #c9d1d9;
  --text-subtle-color: var(--dark-slate-gray);
  --text-muted-color: #8b949e;
  --ds-text: var(--text-color);
  --ds-text-subtlest: var(--text-muted-color);
  --ds-text-subtle: var(--text-color);
  --ds-background-neutral-subtle-hovered: var(--dark-gray);
  background: var(--dark-slate-gray);
  color: var(--text-color);
  font-family: Arial;
  margin: 0;
  padding: 0;
}

[data-resize-button] {
  color: var(--dark-slate-gray) !important;
}
`
export default GlobalStyles
