import React, { useCallback, useEffect } from "react"
import { FormFieldComponentProps } from "../Form"

console.log(electron.openDialog)

const FilePicker: React.FC<FormFieldComponentProps> = ({
  onBlur,
  onChange,
  touched,
  value,
  valid,
}) => {
  const handleFileSelection = useCallback(async () => {
    try {
      const result = await electron.openCsvFile()

      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }, [])

  return (
    <button type="button" onClick={handleFileSelection}>
      Select CSV File
    </button>
  )
}

export default FilePicker
