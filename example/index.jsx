import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Form, Input, Select, Textarea } from './../src/Rfv'

const validations = {
  username: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Please provide a username'
    },
    {
      rule: 'isLength',
      args: { min: 4, max: 32 },
      invalidFeedback: 'Username must be minimum 4, maximum 32 characters'
    }
  ],
  rememberMe: [
    {
      rule: 'equals',
      args: 'on',
      invalidFeedback: 'Please check'
    }
  ],
  dynamicValidation: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Please provide a value'
    }
  ],
  yesOrNo: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Please select an option'
    }
  ],
  message: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Please provide a message'
    }
  ]
}

const App = () => {
  const [checked, setChecked] = useState('off')

  const rememberMeOnChange = () => {
    const newValue = checked === 'on' ? 'off' : 'on'
    setChecked(newValue)
  }

  const preSubmit = res => {
    console.log('preSubmit', res)
  }

  const onSubmit = res => {
    console.log('onSubmit', res)
  }

  const postSubmit = res => {
    console.log('postSubmit', res)

    if (res.data.success) {
      res.setItems({})
    }
  }

  const postOptions = {
    method: 'post',
    url: 'https://rfv-demo-backend-kb3ppjk4g0ol.runkit.sh/test'
  }

  return (
    <Form
      preSubmit={preSubmit}
      onSubmit={onSubmit}
      postSubmit={postSubmit}
      postOptions={postOptions}
    >
      <h2>Demo Form</h2>

      <div>Type "john" into username to see the backend error.</div>

      <br />

      <div>
        <Input
          type='text'
          name='username'
          placeholder='Username'
          validations={validations.username}
        />
      </div>

      <br />

      <div>
        <Input
          type='checkbox'
          id='rememberMe'
          value={checked}
          name='rememberMe'
          onChange={rememberMeOnChange}
          validations={validations.rememberMe}
        />
        <label htmlFor='rememberMe'>
          Remember me
        </label>
      </div>

      <br />

      <div>
        <Input
          type='text'
          name='dynamicValidation'
          placeholder='Dynamic validation'
          validations={checked === 'on' ? validations.dynamicValidation : ''}
        />
      </div>

      <br />

      <div>
        <Select
          name='yesOrNo'
          validations={validations.yesOrNo}
        >
          <option value=''>Select an option</option>
          <option value='yes'>yes</option>
          <option value='no'>no</option>
        </Select>
      </div>

      <br />

      <div>
        <Textarea
          name='message'
          placeholder='Message'
          validations={validations.message}
        />
      </div>

      <br />

      <input type='submit' value='Submit' />
    </Form>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
