import React, { Fragment, useEffect, useState } from 'react'
import validator from 'validator'

const Form = (props) => {
  const { onSubmit, store, ...htmlProps } = props

  return (
    <form
      {...htmlProps}
      onSubmit={(e) => store.formOnSubmit({ onSubmit }, e)}>
      {props.children}
    </form>
  )
}

const Item = (props) => {
  const { opts, store, validations, className, onChange, ...htmlProps } = props

  useEffect(() => {
    store.itemInitialize(props)
  }, [props.value])

  const thisItem = store.state.items[props.name] || {
    value: '',
    className: '',
    invalidFeedback: ''
  }

  let formElement
  if (opts.element === 'input') {
    formElement = (
      <input
        {...htmlProps}
        value={thisItem.value}
        className={`${className}${thisItem.className}`}
        onChange={e => store.itemOnChange(props, e)} />
    )
  } else if (opts.element === 'textarea') {
    formElement = (
      <textarea
        {...htmlProps}
        value={thisItem.value}
        className={`${className}${thisItem.className}`}
        onChange={e => store.itemOnChange(props, e)} />
    )
  } else if (opts.element === 'select') {
    formElement = (
      <select
        {...htmlProps}
        value={thisItem.value}
        className={`${className}${thisItem.className}`}
        onChange={e => store.itemOnChange(props, e)}>
        {props.children}
      </select>
    )
  }

  return (
    <Fragment>
      {formElement}
      {thisItem.invalidFeedback ? (<div className='invalid-feedback'>{thisItem.invalidFeedback}</div>) : null}
    </Fragment>
  )
}

const Input = (props) => <Item {...props} opts={{ element: 'input' }} />
const Textarea = (props) => <Item {...props} opts={{ element: 'textarea' }} />
const Select = (props) => <Item {...props} opts={{ element: 'select' }} />

const Context = React.createContext()

const Provider = (props) => {
  const [items, setItems] = useState({})
  const [formIsValidating, setFormIsValidating] = useState(false)

  const formValidate = () => {
    let howManyItemsValidated = 0
    let howManyItemsAreGonnaValidate = 0

    Object.keys(items).map((key) => {
      const item = items[key]

      item.validations.map((itemValidation, i) => {
        howManyItemsAreGonnaValidate++

        const validate = validator[itemValidation.rule](item.value, itemValidation.args)
        if (validate) {
          itemValidation.validated = true
          howManyItemsValidated++
        } else {
          itemValidation.validated = false
        }
      })

      const unvalidatedItems = []
      item.validations.map((itemValidation, i) => {
        if (!itemValidation.validated) {
          unvalidatedItems.push(itemValidation)
        }
      })

      if (unvalidatedItems.length) {
        item.invalidFeedback = unvalidatedItems[0].invalidFeedback
        item.className = ' is-invalid'
      }
    })

    setItems(items)

    return howManyItemsAreGonnaValidate === howManyItemsValidated || false
  }

  const formOnSubmit = (opts, e) => {
    e.preventDefault()

    setFormIsValidating(true)

    const _formValidate = formValidate()
    opts.onSubmit({ items, isFormValid: _formValidate })
  }

  const itemInitialize = (item) => {
    items[item.name] = {
      value: item.value || '',
      validations: item.validations || []
    }

    setItems(items)

    if (formIsValidating) formValidate()
  }

  const itemOnChange = (props, e) => {
    const item = {
      ...props,
      value: e.target.value
    }

    itemInitialize(item)
  }

  const store = {
    formOnSubmit,
    itemInitialize,
    itemOnChange,
    state: { items }
  }

  return (
    <Context.Provider value={store}>
      {props.children}
    </Context.Provider>
  )
}

const connectProvider = (Component) => {
  return (props) => (
    <Provider>
      <Context.Consumer>
        {(store) => <Component {...props} store={store} />}
      </Context.Consumer>
    </Provider>
  )
}

const connectConsumer = (Component) => {
  return (props) => (
    <Context.Consumer>
      {(store) => <Component {...props} store={store} />}
    </Context.Consumer>
  )
}

module.exports = {
  Form: connectProvider(Form),
  Input: connectConsumer(Input),
  Textarea: connectConsumer(Textarea),
  Select: connectConsumer(Select)
}
