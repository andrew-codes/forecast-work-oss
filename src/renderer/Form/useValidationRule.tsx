import { useCallback } from "react"
import type { FormValuesType, FormValueType } from "./Form"

type ValidationOutputType = string | null
type ChangeType = "change" | "blur" | "any"
type ValidateType = (value: FormValueType, values: FormValuesType) => boolean
type ValidationRuleType = (
  value: FormValueType,
  values: FormValuesType,
  changeType: ChangeType,
) => ValidationOutputType

const useValidationRule = (
  errorMessage: string,
  validate: ValidateType,
  changeType: ChangeType = "any",
) => {
  const rule = useCallback(
    (
      value: FormValueType,
      values: FormValuesType,
      filterChangeType: ChangeType,
    ): ValidationOutputType => {
      if (changeType === "any") {
        return validate(value, values) ? null : errorMessage
      }
      if (changeType === filterChangeType) {
        return validate(value, values) ? null : errorMessage
      }

      return null
    },
    [errorMessage, validate],
  )
  return rule
}

export default useValidationRule
export type {
  ChangeType,
  ValidateType,
  ValidationOutputType,
  ValidationRuleType,
}
