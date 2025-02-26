export interface Store {
    _id: { $oid: string }
    name: string
    userId: string
    createdAt: { $date: { $numberLong: string } }
    updatedAt: { $date: { $numberLong: string } }
}
