import React, { ChangeEvent, FocusEvent, useCallback } from "react"
import styled from "styled-components"
import type { FormFieldComponentProps } from "../Form"
import { ValidityType } from "../Form"

const Input = styled.input<{ borderColor: string }>`
  border: 1px solid ${({ borderColor }) => borderColor};
  width: 100%;
  box-sizing: border-box;
`

const TextField: React.FC<FormFieldComponentProps<string>> = ({
  onBlur,
  onChange,
  touched,
  value,
  valid,
}) => {
  const getBorderColor = () => {
    if (valid === ValidityType.valid) {
      return "green"
    }
    if (valid === ValidityType.invalid) {
      return "pink"
    }
    if (touched) {
      return "blue"
    }
    return "black"
  }

  const blur = useCallback(
    (evt: FocusEvent) => {
      onBlur(evt)
    },
    [onBlur],
  )

  const change = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      onChange(evt, evt.target.value)
    },
    [onChange],
  )

  return (
    <Input
      type="text"
      value={value}
      onBlur={blur}
      onChange={change}
      borderColor={getBorderColor()}
    />
  )
}

export default TextField
