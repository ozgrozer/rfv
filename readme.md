# RFV (React Form Validator)

[![npm](https://img.shields.io/npm/v/rfv.svg?style=flat-square)](https://www.npmjs.com/package/rfv)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ozgrozer/rfv/blob/master/license)

React form validator and form handler.

RFV uses [Validator.js](https://github.com/chriso/validator.js) as a validator engine, and [Axios](https://github.com/axios/axios) for HTTP requests.

[Demo (Only form validator option)](https://codesandbox.io/s/5wq8o1nqzl)

[Demo (Form validator and form handler option)](https://codesandbox.io/s/o572300y0y)

![](https://media.giphy.com/media/MRGE7BQVc0SlM6ieL4/giphy.gif)

## Installation

Install with Yarn.

```sh
$ yarn add rfv
```

Install with NPM.

```sh
$ npm i rfv
```

## Usage

Only form validator option.

```jsx
import React from 'react'
import ReactDOM from 'react-dom'

// Import package
import { Form, Input, Textarea } from 'rfv'

// Create validation rules (https://github.com/chriso/validator.js#validators)
const validations = {
  email: [
    {
      rule: 'isEmail',
      invalidFeedback: 'Please provide a valid email'
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
  // Learn the status of validation with `res.isFormValid` and get your form data as an object with `res.items` to make an AJAX request or something else
  const onSubmit = (res) => {
    if (res.isFormValid) {
      post('url', res.items)
    }
  }

  return (
    // Build your form
    <Form onSubmit={onSubmit}>
      <div>
        <Input
          type='email'
          name='email'
          validations={validations.email} />
      </div>

      <div>
        <Textarea
          name='message'
          validations={validations.message} />
      </div>

      <div>
        <button>Submit</button>
      </div>
    </Form>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```

Form validator and form handler option.

```jsx
import React from 'react'
import ReactDOM from 'react-dom'

// Import package
import { Form, Input, Textarea } from 'rfv'

// Create validation rules (https://github.com/chriso/validator.js#validators)
const validations = {
  email: [
    {
      rule: 'isEmail',
      invalidFeedback: 'Please provide a valid email'
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
  // After an AJAX call, call the `res.data` to get the backend results
  const postSubmit = (res) => {
    console.log(res.data)
  }

  return (
    // Build your form
    <Form
      postSubmit={postSubmit}
      postOptions={{ method: 'post', url: 'url' }}>
      <div>
        <Input
          type='email'
          name='email'
          validations={validations.email} />
      </div>

      <div>
        <Textarea
          name='message'
          validations={validations.message} />
      </div>

      <div>
        <button>Submit</button>
      </div>
    </Form>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```

And add `.is-invalid` and `.invalid-feedback` classes into your CSS.

```css
.is-invalid {
  border: 1px solid #dc3545;
}

.invalid-feedback {
  display: none;
  color: #dc3545;
}

.is-invalid ~ .invalid-feedback {
  display: block;
}
```

Make sure you add the errors to the `validations` object in backend.

```js
app.post('/sign-up', (req, res) => {
  const result = {
    validations: {}
  }

  if (req.body.username === 'john') {
    result.validations.username = 'john is already registered'
  }

  res.send(result)
})
```

## Props & Callbacks

`<Form>`

Props

```jsx
// Since RFV uses Axios for HTTP requests, whatever you pass into postOptions prop except `data: {}`, directly goes into Axios
<Form
  runValidation={true|false}
  postOptions={{
    url: 'url',
    method: 'post',
    headers: {
      'Authorization': 'Token ...'
    }
  }}>
```

Callbacks

```jsx
<Form
  preSubmit={(res) => {
    // res.items
    // res.setItems({})
  }}
  onSubmit={(res) => {
    // res.items
    // res.isFormValid
    // res.setItems({})
  }}
  postSubmit={(res) => {
    // res.data
    // res.error
    // res.items
    // res.isFormValid
    // res.setItems({})
    // res.isPostSubmitFormValid
  }}>
```

`<Input>`, `<Select>`, `<Textarea>`

Props

```jsx
// You can pass more than one validation
<Input
  validations={[
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
  ]} />
```

Callbacks

```jsx
<Input
  onChange={(res) => {
    // res.e
    // res.validated
  }} />
```

## Contribution

Feel free to contribute. Open a new [issue](https://github.com/ozgrozer/rfv/issues), or make a [pull request](https://github.com/ozgrozer/rfv/pulls).

## License

[MIT](https://github.com/ozgrozer/rfv/blob/master/license)
