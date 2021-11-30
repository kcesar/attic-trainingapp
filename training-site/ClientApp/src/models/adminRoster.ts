export interface AdminRoster {
  capApplies: boolean
  created: string
  deleted?: boolean
  email: string
  firstName?: string
  id: number
  lastName?: string
  memberId?: string
  offeringId: number
  onWaitList?: boolean
  phone?: string
}