# RFV (React Form Validator)

[![npm](https://img.shields.io/npm/v/rfv.svg?style=flat-square)](https://www.npmjs.com/package/rfv)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ozgrozer/rfv/blob/master/license)

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

// Create validation rules ([Validator.js](https://github.com/chriso/validator.js#validators))
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

Form validator and posting data option.

```jsx
asd
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

## Props & Callbacks

`<Form>`

Props

```jsx
...
```

Callbacks

```jsx
...
```

`<Input>`, `<Select>`, `<Textarea>`

Props

```jsx
...
```

## Contribution

Feel free to contribute. Open a new [issue](https://github.com/ozgrozer/rfv/issues), or make a [pull request](https://github.com/ozgrozer/rfv/pulls).

## License

[MIT](https://github.com/ozgrozer/rfv/blob/master/license)
