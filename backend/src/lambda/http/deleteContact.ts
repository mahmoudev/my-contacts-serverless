import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteContact } from '../../businessLogic/contactsBL'
import { getUserId } from '../utils'

const logger = createLogger('updateContactLambda')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info("Recieved event", { event })

  const userId = getUserId(event)
  const contactId = event.pathParameters.contactId
  
  deleteContact(userId, contactId)
  return {
    statusCode: 200,
    body: ""
  }
})  

handler.use(
  cors({
    credentials: true
  })
)
