import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchContact} from '../api/contacts-api'
import { Contact } from '../types/Contact'
import { Contacts } from './Contacts'
import { UpdateContactRequest } from '../types/UpdateContactRequest'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditContactProps {
  match: {
    params: {
      contactId: string
    }
  }
  location: {
    state: Contact
  }
  auth: Auth
}

interface EditContactState {
  file: any
  uploadState: UploadState
  contact: UpdateContactRequest
  isUpdating: Boolean
}

export class EditContact extends React.PureComponent<
  EditContactProps,
  EditContactState
> {
  state: EditContactState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    contact: this.props.location.state,
    isUpdating: false
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    var contact = {...this.state.contact}
    contact.contactName = event.target.value
    this.setState({contact})
  }

  handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    var contact = {...this.state.contact}
    contact.contactNumber = event.target.value
    this.setState({contact})  }

  handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    var contact = {...this.state.contact}
    contact.contactEmail = event.target.value
    this.setState({contact})  }

  handleGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    var contact = {...this.state.contact}
    contact.contactGroup = event.target.value
    this.setState({contact}) 
   }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.contactId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  handleUpdateProfile = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      this.setState({isUpdating: true})
      await patchContact(this.props.auth.getIdToken(), this.props.match.params.contactId, this.state.contact)

      alert('Contact details sucessfully updated')
    } catch (e) {
      alert('Could not update contact details: ' + e.message)
    } finally {
      this.setState({isUpdating: false})
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }
  setEditProfileState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }
  render() {
    const contact = this.state.contact
    console.log(contact)
    return (
      <div>
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
      <br/>
      <div>
        <h1>Edit contact details</h1>

        <Form onSubmit={this.handleUpdateProfile}>
          <Form.Field>
            <label>details</label>
            <input
              type="string"
              value={contact.contactName}
              placeholder="Name"
              onChange={this.handleNameChange}
            />
            <input
              type="string"
              value={contact.contactNumber}
              placeholder="Mobile"
              onChange={this.handleNumberChange}
            />
             <input
              type="string"
              value={contact.contactEmail}
              placeholder="Email"
              onChange={this.handleEmailChange}
            />
             <input
              type="string"
              value={contact.contactGroup}
              placeholder="Group"
              onChange={this.handleGroupChange}
            />
          </Form.Field>
          {this.renderUpdateButton()}
        </Form>
      </div>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }

  renderUpdateButton() {
    return (
      <div>
        {this.state.isUpdating&& <p>Updating profile data</p>}
        <Button
          loading={this.state.isUpdating == true}
          type="submit"
        >
          Update
        </Button>
      </div>
    )
  }
}
