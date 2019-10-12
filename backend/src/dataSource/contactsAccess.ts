import * as AWS from 'aws-sdk'
import * as AWSXRAY from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { ContactItem } from '../models/ContactItem'

const logger = createLogger('contactsAccessDataSource')
const XAWS = AWSXRAY.captureAWS(AWS)

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpeiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export class ContactsAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly contactsTable = process.env.CONTACTS_TABLE) {
    }

    async getUserContacts(userId: String): Promise<ContactItem[]>{
        logger.info("Getting user contacts", {
            userId
        })

        const result = await this.docClient.query({
            TableName: this.contactsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise()

        const userContacts = result.Items as ContactItem[]
        logger.info("Contacts items retrieved from dynamoDB", {
            userId,
            userContacts: userContacts
        })

        return userContacts
    }

    async createContact(contactItem: ContactItem): Promise<ContactItem>{
        logger.info("creating contact item", { contactItem: contactItem })
        await this.docClient.put({
            TableName: this.contactsTable,
            Item: contactItem
        }).promise()
        logger.info("contact item created", { contactItem: contactItem })
        return contactItem
    }
    
    async updateContact(userId: string, contactId: string, contactName: string, contactNumber: string, 
        contactEmail: string, contactGroup: string){
        logger.info("updating contact item", {contactId: contactId})
        await this.docClient.update({
            TableName: this.contactsTable, 
            Key: {
                "userId": userId,
                "contactId": contactId
            },
            UpdateExpression: "set contactName = :contactName, contactNumber = :contactNumber, contactEmail = :contactEmail, contactGroup = :contactGroup",
            ExpressionAttributeValues: {
                ":contactName": contactName,
                ":contactNumber": contactNumber,
                ":contactEmail": contactEmail,
                ":contactGroup": contactGroup
            }
        }).promise()
    }

    async deleteContact(userId: string, contactId: string){
        logger.info("deleting contact item", {userId, contactId: contactId})
        await this.docClient.delete({
            TableName: this.contactsTable,
            Key: {
                "userId": userId,
                "contactId": contactId
            }
        }).promise()
    }

    generateUploadUrl(contactId: string){
        logger.info("generating contact upload url ")
        return s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: contactId,
            Expires: +urlExpeiration
        })
    }

}