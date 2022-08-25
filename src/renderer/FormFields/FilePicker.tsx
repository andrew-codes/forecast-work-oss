import React, { useCallback, useEffect, useState } from "react"
import { FormFieldComponentProps } from "../Form"

const FilePicker = <TValue extends any>({
  onBlur,
  onChange,
  touched,
  value,
  valid,
}: FormFieldComponentProps<TValue>): JSX.Element => {
  const [results, setResults] = useState(value)
  const handleFileSelection = useCallback(async (evt) => {
    try {
      const results = await electron.openCsvFile()
      onBlur(evt)
      setResults(results)
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    onChange(null, results)
  }, [results])

  return (
    <button type="button" onClick={handleFileSelection}>
      Select CSV File
    </button>
  )
}

export default FilePicker
