import styled from "styled-components"

const VerticalSpacedGroup = styled.div<{ spaced: number }>`
  flex: 1;
  display: flex;
  flex-direction: column;

  > * {
    padding: 1px 0;
    border: 1px solid rgba(0, 0, 0, 0);
    margin: ${({ spaced }) => `${spaced / 2}px 0 ${spaced / 2}px 0`} !important;
    display: block;
  }
  > *:first-child {
    padding: 1px 0;
    border: 1px solid rgba(0, 0, 0, 0);
    margin-top: ${({ spaced }) => `0`} !important;
    display: block;
  }
  > *:last-child {
    padding: 1px 0;
    border: 1px solid rgba(0, 0, 0, 0);
    margin-bottom: ${({ spaced }) => `0`} !important;
    display: block;
  }
`
export default VerticalSpacedGroup
