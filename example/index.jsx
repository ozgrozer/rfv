import React, { useState, useEffect } from 'react'
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
  const [message, setMessage] = useState('')
  useEffect(() => {
    setTimeout(() => {
      setMessage('3 seconds past')
    }, 3000)
  }, [])

  const onSubmit = (res) => {
    console.log(res)
  }

  return (
    <Form
      onSubmit={onSubmit}
      action='https://runkit.io/ozgrozer/recassfov-backend-demo/branches/master/signup'>
      <h2>Demo Form</h2>

      <div>- Type "john" into username to see backend error.</div>
      <div>- Watch console.</div>

      <br />

      <div>
        <Input
          type='text'
          name='username'
          placeholder='Username'
          validations={validations.username} />
      </div>

      <br />

      <div>
        <Select
          name='yesOrNo'
          validations={validations.yesOrNo}>
          <option value=''>Select an option</option>
          <option value='yes'>yes</option>
          <option value='no'>no</option>
        </Select>
      </div>

      <br />

      <div>
        <Textarea
          name='message'
          value={message}
          placeholder='Message'
          validations={validations.message} />
      </div>

      <br />

      <input type='submit' value='Submit' />
    </Form>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
