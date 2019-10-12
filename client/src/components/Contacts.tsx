import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Label
} from 'semantic-ui-react'

import { createContact, deleteContact, getContacts, patchContact } from '../api/contacts-api'
import Auth from '../auth/Auth'
import { Contact } from '../types/Contact'

interface ContactsProps {
  auth: Auth
  history: History
}

interface ContactsState {
  contacts: Contact[]
  newContactName: string
  newContactNumber: string
  newContactEmail: string
  newContactGroup: string
  loadingContacts: boolean
}

export class Contacts extends React.PureComponent<ContactsProps, ContactsState> {
  state: ContactsState = {
    contacts: [],
    newContactName: '',
    newContactNumber: '',
    newContactEmail: '',
    newContactGroup: '',
    loadingContacts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newContactName: event.target.value })
  }

  handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newContactNumber: event.target.value })
  }

  handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newContactEmail: event.target.value })
  }

  handleGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newContactGroup: event.target.value })
  }

  onEditButtonClick = (contact: Contact) => {
    console.log("editing contact id:", contact.contactId)
    const profileDetails = {
      contactName: contact.contactName,
      contactNumber: contact.contactNumber,
      contactEmail: contact.contactEmail,
      contactGroup: contact.contactGroup
    }
    this.props.history.push(`/contacts/${contact.contactId}/edit`, profileDetails)
  }

  onContactCreate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const newContact = await createContact(this.props.auth.getIdToken(), {
        contactName: this.state.newContactName,
        contactNumber: this.state.newContactNumber,
        contactEmail: this.state.newContactEmail,
        contactGroup: this.state.newContactGroup
      })
      this.setState({
        contacts: [...this.state.contacts, newContact],
        newContactName: ''
      })
    } catch {
      alert('Contact creation failed')
    }
  }

  onContactDelete = async (contactId: string) => {
    try {
      await deleteContact(this.props.auth.getIdToken(), contactId)
      this.setState({
        contacts: this.state.contacts.filter(contact => contact.contactId != contactId)
      })
    } catch {
      alert('Contact deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const contacts = await getContacts(this.props.auth.getIdToken())
      this.setState({
        contacts: contacts,
        loadingContacts: false
      })
    } catch (e) {
      alert(`Failed to fetch contacts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Contacts</Header>

        {this.renderCreateContactInput()}

        {this.renderContacts()}
      </div>
    )
  }

  renderCreateContactInput() {
    return (
       <Grid.Row>
        <Grid.Column width={2} verticalAlign="middle">
          <Input
            placeholder="Name"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={2} verticalAlign="middle">
          <Input
            placeholder="Mobile"
            onChange={this.handleNumberChange}
          />
        </Grid.Column>
        <Grid.Column width={2} verticalAlign="middle">
          <Input
            placeholder="Email"
            onChange={this.handleEmailChange}
          />
        </Grid.Column>
        <Grid.Column width={2} verticalAlign="middle">
          <Input
            placeholder="Group"
            onChange={this.handleGroupChange}
          />
        </Grid.Column>
        <Grid.Column width={4} verticalAlign="middle">
          <Button
            icon
            vale
            color="green"
            onClick={this.onContactCreate}>
              Add New Contact
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderContacts() {
    if (this.state.loadingContacts) {
      return this.renderLoading()
    }

    return this.renderContactsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading My Contacts
        </Loader>
      </Grid.Row>
    )
  }

  renderContactsList() {
    console.log("TTTT", this.state.contacts)
    return (
      <Grid padded>
        {(this.state.contacts.length > 0  && <Grid.Row>
          <Grid.Column width={2} verticalAlign="middle">
            <Label>Image</Label>
          </Grid.Column>
          <Grid.Column width={2} verticalAlign="middle">
          <Label>Name</Label>
          </Grid.Column>
          <Grid.Column width={2} verticalAlign="middle">
          <Label>Mobile</Label>
          </Grid.Column>
          <Grid.Column width={2} verticalAlign="middle">
          <Label>Email</Label>
          </Grid.Column>
          <Grid.Column width={2} verticalAlign="middle">
          <Label>Group</Label>
          </Grid.Column>
        </Grid.Row>)}
        {this.state.contacts.map((contact, pos) => {
          console.log("contact",contact)
          return (
            <Grid.Row key={contact.contactId}>
              <Grid.Column width={2} verticalAlign="middle">
                {contact.contactImageURL && (<Image src={contact.contactImageURL} size="small" wrapped />)}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                {contact.contactName}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                {contact.contactNumber}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                {contact.contactEmail}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                {contact.contactGroup}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(contact)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onContactDelete(contact.contactId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {/* {contact.contactImageURL && (
                <Image src={contact.contactImageURL} size="small" wrapped />
              )} */}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
            
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
