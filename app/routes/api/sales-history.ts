import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '../../../db'
import { salesRecords, agents } from '../../../db/schema'

export const APIRoute = createAPIFileRoute('/api/sales-history')({
  GET: ({ request, params }) => {
    return json({ message: 'Hello "/api/sales-history"!' })
  },
})
