import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateContactRequest as CreateContactRequest } from '../../requests/CreateContactRequest'
import { createContact as createContact } from '../../businessLogic/contactsBL'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'

const logger = createLogger('createContactLambda')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Recieved event", { event })
  const userId =  getUserId(event)
  const newContact: CreateContactRequest = JSON.parse(event.body)
  const createdContact = await createContact(userId, newContact)
  return {
    statusCode: 201,
    body: JSON.stringify(createdContact)
  }
})

handler.use(
  cors({
    credentials: true
  })
)
