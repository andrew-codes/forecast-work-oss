import { useCallback } from "react"
import type { FieldsType, FieldType } from "./Form"

type ValidationOutputType = string | null
type ChangeType = "change" | "blur" | "any"
type ValidateType<TValue> = (
  value: FieldType<TValue>,
  values: FieldsType,
) => boolean
type ValidationRuleType<TValue> = (
  value: FieldType<TValue>,
  values: FieldsType,
  changeType: ChangeType,
) => ValidationOutputType

const useValidationRule = <TValue extends any>(
  errorMessage: string,
  validate: ValidateType<TValue>,
  changeType: ChangeType = "any",
) => {
  const rule = useCallback(
    (
      field: FieldType<TValue>,
      fields: FieldsType,
      filterChangeType: ChangeType,
    ): ValidationOutputType => {
      if (changeType === "any") {
        return validate(field, fields) ? null : errorMessage
      }
      if (changeType === filterChangeType) {
        return validate(field, fields) ? null : errorMessage
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
