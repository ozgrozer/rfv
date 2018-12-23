import React, { Fragment, useEffect, useState } from 'react'
import validator from 'validator'
import axios from 'axios'

const Form = (props) => {
  const { preSubmit, onSubmit, postSubmit, postOptions, store, ...htmlProps } = props

  return (
    <form
      noValidate
      {...htmlProps}
      onSubmit={(e) => store.formOnSubmit({ preSubmit, onSubmit, postSubmit, postOptions }, e)}>
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

  const itemClassName = (className || '') + (thisItem.className ? (className ? ' ' : '') + thisItem.className : '')

  let formElement
  if (opts.element === 'input') {
    formElement = (
      <input
        {...htmlProps}
        value={thisItem.value}
        className={itemClassName}
        onChange={e => store.itemOnChange(props, e)} />
    )
  } else if (opts.element === 'textarea') {
    formElement = (
      <textarea
        {...htmlProps}
        value={thisItem.value}
        className={itemClassName}
        onChange={e => store.itemOnChange(props, e)} />
    )
  } else if (opts.element === 'select') {
    formElement = (
      <select
        {...htmlProps}
        value={thisItem.value}
        className={itemClassName}
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
        item.className = 'is-invalid'
      }
    })

    setItems(items)

    return howManyItemsAreGonnaValidate === howManyItemsValidated || false
  }

  const formOnSubmit = (opts, e) => {
    e.preventDefault()

    if (opts.preSubmit) {
      opts.preSubmit({
        setItems: itemSet,
        items: itemsAndValues()
      })
    }

    setFormIsValidating(true)

    const isFormValid = formValidate()

    if (opts.onSubmit) {
      opts.onSubmit({
        setItems: itemSet,
        items: itemsAndValues(),
        isFormValid: isFormValid
      })
    }

    if (isFormValid && opts.postOptions) {
      opts.postOptions.data = itemsAndValues()

      axios({...opts.postOptions})
        .then((res) => {
          const validations = res.data.validations || {}

          let isPostSubmitFormValid = true
          if (Object.keys(validations).length) {
            isPostSubmitFormValid = false

            Object.keys(validations).map((key) => {
              items[key].invalidFeedback = validations[key]
              items[key].className = 'is-invalid'
            })

            setItems(items)
          }

          if (opts.postSubmit) {
            opts.postSubmit({
              isFormValid,
              data: res.data,
              setItems: itemSet,
              isPostSubmitFormValid,
              items: itemsAndValues()
            })
          }
        })
        .catch((err) => {
          if (opts.postSubmit) {
            opts.postSubmit({
              error: err,
              isFormValid,
              setItems: itemSet,
              items: itemsAndValues()
            })
          }
        })
    }
  }

  const itemsAndValues = () => {
    const data = {}

    Object.keys(items).map((key) => {
      const item = items[key]
      data[key] = item.value
    })

    return data
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

  const itemSet = (opts) => {
    if (opts) {
      const optsKeys = Object.keys(opts)
      const itemKeys = Object.keys(items)

      if (optsKeys.length) {
        itemKeys.map((key) => {
          const item = items[key]

          if (opts.hasOwnProperty(key)) {
            item.value = opts[key]
          }
        })
      } else {
        itemKeys.map((key) => {
          const item = items[key]
          item.value = ''
        })
      }

      setItems(items)
    }
  }

  const store = {
    formOnSubmit,
    itemInitialize,
    itemOnChange,
    setItems: itemSet,
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
