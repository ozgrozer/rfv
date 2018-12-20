import React from 'react'

const Form = (props) => {
  return (
    <form>{props.children}</form>
  )
}

const Input = (props) => {
  return (
    <input {...props} />
  )
}

const Textarea = (props) => {
  return (
    <textarea {...props} />
  )
}

const Select = (props) => {
  return (
    <select>{props.children}</select>
  )
}

module.exports = { Form, Input, Textarea, Select }
