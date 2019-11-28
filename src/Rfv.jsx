import React, { Fragment, useEffect, useState } from 'react'
import validator from 'validator'
import axios from 'axios'

const Form = (props) => {
  const { runValidation, preSubmit, onSubmit, postSubmit, postOptions, store, ...htmlProps } = props

  useEffect(() => {
    store.runValidation(runValidation)
  }, [runValidation])

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
    if (opts.type === 'checkbox') {
      formElement = (
        <input
          {...htmlProps}
          value={thisItem.value}
          className={itemClassName}
          checked={thisItem.value === 'on'}
          onChange={e => store.itemOnChange({ props, e, onChange })} />
      )
    } else {
      formElement = (
        <input
          {...htmlProps}
          value={thisItem.value}
          className={itemClassName}
          onChange={e => store.itemOnChange({ props, e, onChange })} />
      )
    }
  } else if (opts.element === 'textarea') {
    formElement = (
      <textarea
        {...htmlProps}
        value={thisItem.value}
        className={itemClassName}
        onChange={e => store.itemOnChange({ props, e, onChange })} />
    )
  } else if (opts.element === 'select') {
    formElement = (
      <select
        {...htmlProps}
        value={thisItem.value}
        className={itemClassName}
        onChange={e => store.itemOnChange({ props, e, onChange })}>
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

const Input = (props) => <Item {...props} opts={{ element: 'input', type: props.type }} />
const Textarea = (props) => <Item {...props} opts={{ element: 'textarea' }} />
const Select = (props) => <Item {...props} opts={{ element: 'select' }} />

const Context = React.createContext()

const Provider = (props) => {
  const [items, setItems] = useState({})
  const [interestingBug, setInterestingBug] = useState('')
  const [formIsValidating, setFormIsValidating] = useState(false)

  const itemValidate = (opts) => {
    const item = items[opts.name]

    item.validations.map((itemValidation, i) => {
      const validate = validator[itemValidation.rule](item.value, itemValidation.args)
      if (validate) {
        itemValidation.validated = true
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

    item.validated = !unvalidatedItems.length || false
  }

  const formUnvalidate = () => {
    Object.keys(items).map((key) => {
      const item = items[key]
      item.className = ''
    })
    setItems(items)
  }

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
        e,
        setItems: itemSet,
        items: itemsAndValues()
      })
    }

    setFormIsValidating(true)

    const isFormValid = formValidate()

    if (opts.onSubmit) {
      opts.onSubmit({
        e,
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

            const newItems = Object.assign({}, items)
            setItems(newItems)
          }

          if (opts.postSubmit) {
            opts.postSubmit({
              e,
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
    let itemValue = item.value || ''
    if (item.opts.element === 'input' && item.opts.type === 'checkbox') {
      if (Object.prototype.hasOwnProperty.call(item, 'checked')) {
        itemValue = item.checked ? 'on' : 'off'
      }
    }

    items[item.name] = {
      value: itemValue,
      validations: item.validations || []
    }

    setInterestingBug(itemValue)

    const newItems = Object.assign({}, items)
    setItems(newItems)

    if (formIsValidating) formValidate()
  }

  const itemOnChange = (opts) => {
    const item = {
      ...opts.props,
      checked: opts.e.target.checked,
      value: opts.e.target.value
    }

    itemInitialize(item)

    if (opts.onChange) {
      itemValidate({ name: opts.props.name })
      opts.onChange({ e: opts.e, validated: items[opts.props.name].validated })
    }
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

  const runValidation = (trueFalse) => {
    setFormIsValidating(trueFalse)
    if (trueFalse) {
      formValidate()
    } else {
      formUnvalidate()
    }
  }

  const store = {
    formOnSubmit,
    itemInitialize,
    itemOnChange,
    runValidation,
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
