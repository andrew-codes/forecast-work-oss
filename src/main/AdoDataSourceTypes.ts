type AdoConnection = {
  organizationName: string
  projectName: string
  accessToken: string
  username: string
}
type AdoQueryValues = {
  teamMemberIds: string[]
}

export type { AdoConnection, AdoQueryValues }
