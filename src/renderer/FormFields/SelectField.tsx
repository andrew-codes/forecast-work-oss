import Select from "@atlaskit/select"
import { isEmpty } from "lodash"
import React from "react"
import { FormFieldComponentProps } from "../Form"

const SelectField: React.FC<
  FormFieldComponentProps<{ label: string; value: string }[]> & {
    isMulti: boolean
    options: { label: string; value: string }[]
    placeholder: string
  }
> = ({ isMulti, options, onBlur, onChange, placeholder, value }) => (
  <Select
    value={value}
    isMulti={isMulti}
    options={options}
    onBlur={onBlur}
    onChange={(v: { label: string; value: string }[], action) => {
      onChange(null, v)
    }}
    placeholder={placeholder}
  />
)

export default SelectField
