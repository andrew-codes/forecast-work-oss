import React from "react"
import FormContext from "./FormContext"

type FormProviderProps = { children: React.ReactNode; id: string }

const FormProvider: React.FC<FormProviderProps> = ({ children, id }) => (
  <FormContext.Provider value={id}>{children}</FormContext.Provider>
)

export { FormProvider, FormProviderProps }
