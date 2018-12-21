import React, { Fragment, useEffect, useState } from 'react'
import validator from 'validator'

const Form = (props) => {
  const { store, postUrl, className, onChange, ...htmlProps } = props

  return (
    <form
      {...htmlProps}
      onSubmit={store.formOnSubmit}>
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
    invalidFeedback: ''
  }

  let formElement
  if (opts.element === 'input') {
    formElement = (
      <input
        {...htmlProps}
        value={thisItem.value}
        onChange={e => store.itemOnChange(props, e)} />
    )
  } else if (opts.element === 'textarea') {
    formElement = (
      <textarea
        {...htmlProps}
        value={thisItem.value}
        onChange={e => store.itemOnChange(props, e)} />
    )
  } else if (opts.element === 'select') {
    formElement = (
      <select
        {...htmlProps}
        value={thisItem.value}
        onChange={e => store.itemOnChange(props, e)}>
        {props.children}
      </select>
    )
  }

  return (
    <Fragment>
      {formElement}
      {thisItem.invalidFeedback ? (<div>{thisItem.invalidFeedback}</div>) : null}
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

      item.invalidFeedback = unvalidatedItems.length ? unvalidatedItems[0].invalidFeedback : ''
    })

    setItems(items)

    if (howManyItemsAreGonnaValidate === howManyItemsValidated) {
      return true
    }
  }

  const formOnSubmit = (e) => {
    e.preventDefault()

    setFormIsValidating(true)

    if (formValidate()) {
      console.log('form is valid')
    } else {
      console.log('form is not valid')
    }
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
