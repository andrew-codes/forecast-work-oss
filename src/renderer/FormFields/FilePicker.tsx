import React, { useCallback, useEffect, useRef, useState } from "react"
import styled from 'styled-components'
import { FormFieldComponentProps } from "../Form"

const HiddenInput = styled.input`
display: none;
`
const FileSelector = styled(HiddenInput)``
const FilePath = styled.input`
background: rgba(0,0,0,0);
border: none;
border-bottom: 1px solid var(--text-color);
color: var(--text-color);
width: 100%
`

const FilePicker: React.FC<FormFieldComponentProps<string> & { accept: string }> = ({
  accept,
  onBlur,
  onChange,
  touched,
  value,
  valid,
}) => {
  const filePath = useRef<HTMLInputElement>()
  const handleFileSelection = useCallback(async (evt) => {
    onChange(evt, evt.target.files[0].path)
    filePath.current.blur()
  }, [])

  const handleFilePathChange = useCallback((evt) => {
    onChange(evt, evt.target.value)
  }, [value])

  const fileSelector = useRef<HTMLInputElement>()
  const handleFilePathClick = useCallback(evt => {
    fileSelector.current.click()
  }, [])

  return (
    <>
      <FileSelector ref={fileSelector} type="file" accept={accept} onChange={handleFileSelection} />
      <FilePath ref={filePath} data-test="FilePath" type="text" value={value} onClick={handleFilePathClick} onChange={handleFilePathChange} />
    </>
  )
}

export default FilePicker
