import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {getUserContacts as getUserContacts} from '../../businessLogic/contactsBL'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { getUserId } from '../utils'

const logger = createLogger('getContactsLambda')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Recieved event', { event })

  const userId = getUserId(event)

  logger.info('Getting contacts for user', { userId })
  const userContacts = await getUserContacts(userId)

  if(userContacts.length !== 0){
    return {
      statusCode: 200,
      body: JSON.stringify(userContacts)
    }
  }else{
    return {
      statusCode: 200,
      body: JSON.stringify([])
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
