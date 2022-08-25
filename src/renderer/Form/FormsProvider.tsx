import React, {
  EventHandler,
  SyntheticEvent,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react"
import { noop } from "lodash"
import type { FieldsType } from "./Form"
import FormsContext from "./FormsContext"
import type { FieldType } from "."
import { merge } from "@fluentui/react"

type FormsProviderProps = { children: React.ReactNode }
type RegisterFormType = (id: string) => void
type GetFormValuesType = (id: string) => FieldsType
type SetValueType = (id: string, value: FieldType) => void
type SetValuesType = (id: string, values: FieldsType) => void
type GetHandlers = (id: string) => {
  reset: EventHandler<SyntheticEvent>
  submit: EventHandler<SyntheticEvent>
}
type RegisterEventHandlers = (
  id: string,
  handlers: {
    reset: EventHandler<SyntheticEvent>
    submit: EventHandler<SyntheticEvent>
  },
) => void

type RegisterAction = { type: "register"; payload: { id: string } }
type SetOneAction = {
  type: "setOne"
  payload: { id: string; value: FieldType }
}
type SetAllAction = {
  type: "setAll"
  payload: { id: string; values: FieldsType }
}
type Action = RegisterAction | SetOneAction | SetAllAction
const reducer = (
  state: Record<string, FieldsType> = {},
  action: Action,
): Record<string, FieldsType> => {
  switch (action.type) {
    case "register":
      return { ...state, [action.payload.id]: {} }
    case "setOne":
      return {
        ...state,
        [action.payload.id]: {
          ...state[action.payload.id],
          [action.payload.value.name]: action.payload.value,
        },
      }
    case "setAll":
      return {
        ...state,
        [action.payload.id]: action.payload.values,
      }
  }
}

const FormsProvider: React.FC<FormsProviderProps> = ({ children }) => {
  const [forms, dispatch] = useReducer(reducer, {})
  const [eventHandlers, setEventHandlers] = useState<
    Record<
      string,
      {
        reset: EventHandler<SyntheticEvent>
        submit: EventHandler<SyntheticEvent>
      }
    >
  >({})

  const registerForm = useCallback<RegisterFormType>(
    (id) => {
      dispatch({ type: "register", payload: { id } })
    },
    [dispatch],
  )

  const getValues = useCallback<GetFormValuesType>(
    (id) => {
      return forms[id] ?? {}
    },
    [forms],
  )
  const setValue = useCallback<SetValueType>(
    (id, value) => {
      dispatch({
        type: "setOne",
        payload: {
          id,
          value,
        },
      })
    },
    [dispatch],
  )
  const setValues = useCallback<SetValuesType>(
    (id, values) => {
      dispatch({
        type: "setAll",
        payload: {
          id,
          values,
        },
      })
    },
    [dispatch],
  )

  const getHandlers = useCallback<GetHandlers>(
    (id) => {
      const handlers = eventHandlers[id]
      if (!handlers) {
        return { reset: noop, submit: noop }
      }

      return handlers
    },
    [eventHandlers],
  )
  const registerEventHandlers = useCallback<RegisterEventHandlers>(
    (id, handlers) => {
      delete eventHandlers[id]
      eventHandlers[id] = handlers
      setEventHandlers(eventHandlers)
    },
    [eventHandlers, setEventHandlers],
  )
  const ctxValue = useMemo(
    () => ({
      eventHandlers,
      forms,
      getHandlers,
      getValues,
      registerEventHandlers,
      registerForm,
      setValue,
      setValues,
    }),
    [forms, eventHandlers],
  )

  return (
    <FormsContext.Provider value={ctxValue}>{children}</FormsContext.Provider>
  )
}

export { FormsProvider, FormsProviderProps }
