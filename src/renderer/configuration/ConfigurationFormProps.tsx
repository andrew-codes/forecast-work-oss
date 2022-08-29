import { FormType } from "../Form"

type ConfigurationFormProps = {
  id: string
  onSubmit: (evt: React.SyntheticEvent, form: FormType) => void
}

export default ConfigurationFormProps