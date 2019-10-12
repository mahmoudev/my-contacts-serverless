import { ContactsAccess } from "../dataSource/contactsAccess"
import { CreateContactRequest } from "../requests/CreateContactRequest"
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { UpdateContactRequest } from "../requests/UpdateContactRequest"
import { ContactItem } from "../models/ContactItem"

const bucketName = process.env.IMAGES_S3_BUCKET
const logger = createLogger('userContactsBusinessLogic')
const contactsAccess = new ContactsAccess()

export async function getUserContacts(userId: string): Promise<ContactItem[]> {
    logger.info("Getting user contacts", {
        userId
    })
    const userContacts = await contactsAccess.getUserContacts(userId)
    logger.info("Contacts items retrieved from datasource", {
        userId,
        userContacts: userContacts
    })
    return userContacts
}

export async function createContact(userId: string, createContactRequest: CreateContactRequest): Promise<ContactItem>{
    const contactId = uuid.v4()
    
    logger.info("Creating new contact item", {
        userId,
        contactId: contactId,
        createContactRequest: createContactRequest
    })

    return contactsAccess.createContact(
        {
            userId: userId,
            contactId: contactId,
            contactName: createContactRequest.contactName,
            contactNumber: createContactRequest.contactNumber,
            contactEmail: createContactRequest.contactEmail,
            contactGroup: createContactRequest.contactGroup,
            contactImageURL: `https://${bucketName}.s3.amazonaws.com/${contactId}`,
            createdAt: new Date().toISOString()
        }
    )
}

export async function updateContact(userId: string, contactId: string, updateContactRequest: UpdateContactRequest) {
    logger.info("Updating contact item", {contactId: contactId, updateContactRequest: updateContactRequest})
    
    await contactsAccess.updateContact(
        userId,
        contactId, 
        updateContactRequest.contactName, 
        updateContactRequest.contactNumber, 
        updateContactRequest.contactEmail,
        updateContactRequest.contactGroup
    )
}

export async function deleteContact(userId: string, contactId: string){
    logger.info("deleting contact item", {userId, contactId: contactId})

    await contactsAccess.deleteContact(
        userId,
        contactId
    )
}

export function generateUploadUrl(contactId: string): string{
    return contactsAccess.generateUploadUrl(contactId)
}