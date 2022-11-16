import React, { ChangeEvent, FocusEvent, ReactNode, useCallback } from "react"
import styled from "styled-components"
import type { FormFieldComponentProps } from "../Form"
import { ValidityType } from "../Form"

const Input = styled.input<{ borderColor: string }>`
  border: 1px solid ${({ borderColor }) => borderColor};
  box-sizing: border-box;
`

const RadioLabel = styled.label`
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  > *:first-child {
    margin-right: 14px;
  }
`

const RadioGroupField: React.FC<
  FormFieldComponentProps<string> & {
    options: { label: string; value: string }[]
  }
> = ({ name, onBlur, onChange, options, touched, value, valid }) => {
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
    <>
      {options.map((option, index) => (
        <RadioLabel key={index}>
          {option.label}
          <Input
            checked={value === option.value}
            name={name}
            type="radio"
            value={option.value}
            onBlur={blur}
            onChange={change}
            borderColor={getBorderColor()}
          />
        </RadioLabel>
      ))}
    </>
  )
}

export default RadioGroupField
