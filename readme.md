# RFV (React Form Validator)

[![npm](https://img.shields.io/npm/v/rfv.svg?style=flat-square)](https://www.npmjs.com/package/rfv)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ozgrozer/rfv/blob/master/license)

## Installation

Install package.

```sh
$ yarn add rfv
```

## Usage (Form Validator)

1/5. Import package.

```jsx
import { Form, Input, Textarea } from 'rfv'
```

2/5. Create validation rules. ([Validator.js](https://github.com/chriso/validator.js#validators))

```jsx
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
```

3/5. Learn the status of validation with `res.isFormValid` and get your data as an object with `res.items`.

```jsx
const onSubmit = (res) => {
  if (res.isFormValid) {
    post('url', res.items)
  }
}
```

4/5. Build your form.

```jsx
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
```

5/5. Add `.is-invalid` and `.invalid-feedback` classes into your CSS.

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

## Contribution

Feel free to contribute. Open a new [issue](https://github.com/ozgrozer/rfv/issues), or make a [pull request](https://github.com/ozgrozer/rfv/pulls).

## License

[MIT](https://github.com/ozgrozer/rfv/blob/master/license)
