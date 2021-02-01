/* eslint react/jsx-fragments: 0 */

import React, { Fragment, useEffect, useState } from 'react'
import validator from 'validator'
import axios from 'axios'

const _Form = props => {
  const { runValidation, preSubmit, onSubmit, postSubmit, removeItems, postOptions, store, ...htmlProps } = props

  useEffect(() => {
    store.runValidation(runValidation)
  }, [runValidation])

  useEffect(() => {
    if (typeof removeItems !== 'undefined' && removeItems.length) {
      store.removeItems(removeItems)
    }
  }, [removeItems])

  return (
    <form
      noValidate
      {...htmlProps}
      onSubmit={(e) => store.formOnSubmit({ preSubmit, onSubmit, postSubmit, postOptions }, e)}
    >
      {props.children}
    </form>
  )
}

const Item = props => {
  const { opts, store, validations, className, onChange, ...htmlProps } = props

  useEffect(() => {
    store.itemInitialize(props)
  }, [props.value])

  useEffect(() => {
    store.itemInitialize({ ...props, action: 'validations' })
  }, [validations])

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
          onChange={e => store.itemOnChange({ props, e, onChange })}
        />
      )
    } else {
      formElement = (
        <input
          {...htmlProps}
          value={thisItem.value}
          className={itemClassName}
          onChange={e => store.itemOnChange({ props, e, onChange })}
        />
      )
    }
  } else if (opts.element === 'textarea') {
    formElement = (
      <textarea
        {...htmlProps}
        value={thisItem.value}
        className={itemClassName}
        onChange={e => store.itemOnChange({ props, e, onChange })}
      />
    )
  } else if (opts.element === 'select') {
    formElement = (
      <select
        {...htmlProps}
        value={thisItem.value}
        className={itemClassName}
        onChange={e => store.itemOnChange({ props, e, onChange })}
      >
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

const _Input = props => <Item {...props} opts={{ element: 'input', type: props.type }} />
const _Textarea = props => <Item {...props} opts={{ element: 'textarea' }} />
const _Select = props => <Item {...props} opts={{ element: 'select' }} />

const Context = React.createContext()

const Provider = props => {
  const [items, setItems] = useState({})
  const [interestingBug, setInterestingBug] = useState('')
  const [formIsValidating, setFormIsValidating] = useState(false)

  const itemValidate = opts => {
    const item = items[opts.name]

    for (const key in item.validations) {
      const itemValidation = item.validations[key]
      const validate = validator[itemValidation.rule](item.value, itemValidation.args)
      if (validate) {
        itemValidation.validated = true
      } else {
        itemValidation.validated = false
      }
    }

    const unvalidatedItems = []
    for (const key in item.validations) {
      const itemValidation = item.validations[key]
      if (!itemValidation.validated) {
        unvalidatedItems.push(itemValidation)
      }
    }

    item.validated = !unvalidatedItems.length || false
  }

  const formUnvalidate = () => {
    for (const key in items) {
      const item = items[key]
      item.className = ''
    }
    setItems(items)
  }

  const formValidate = () => {
    let howManyItemsValidated = 0
    let howManyItemsAreGonnaValidate = 0

    for (const key in items) {
      const item = items[key]

      for (const key in item.validations) {
        const itemValidation = item.validations[key]
        howManyItemsAreGonnaValidate++

        const validate = validator[itemValidation.rule](item.value, itemValidation.args)
        if (validate) {
          itemValidation.validated = true
          howManyItemsValidated++
        } else {
          itemValidation.validated = false
        }
      }

      const unvalidatedItems = []
      for (const key in item.validations) {
        const itemValidation = item.validations[key]
        if (!itemValidation.validated) {
          unvalidatedItems.push(itemValidation)
        }
      }

      if (unvalidatedItems.length) {
        item.invalidFeedback = unvalidatedItems[0].invalidFeedback
        item.className = 'is-invalid'
      }
    }

    setItems(items)

    return howManyItemsAreGonnaValidate === howManyItemsValidated || false
  }

  const formOnSubmit = (opts, e) => {
    e.preventDefault()

    if (opts.preSubmit) {
      opts.preSubmit({
        e,
        removeItems,
        setItems: itemSet,
        items: itemsAndValues()
      })
    }

    setFormIsValidating(true)

    const isFormValid = formValidate()

    if (opts.onSubmit) {
      opts.onSubmit({
        e,
        removeItems,
        setItems: itemSet,
        items: itemsAndValues(),
        isFormValid: isFormValid
      })
    }

    if (isFormValid && opts.postOptions) {
      opts.postOptions.data = itemsAndValues()

      axios({ ...opts.postOptions })
        .then((res) => {
          const validations = res.data.validations || {}

          let isPostSubmitFormValid = true
          if (Object.keys(validations).length) {
            isPostSubmitFormValid = false

            for (const key in validations) {
              const validation = validations[key]
              items[key].invalidFeedback = validation
              items[key].className = 'is-invalid'
            }

            const newItems = Object.assign({}, items)
            setItems(newItems)
          }

          if (opts.postSubmit) {
            opts.postSubmit({
              e,
              removeItems,
              isFormValid,
              data: res.data,
              setItems: itemSet,
              isPostSubmitFormValid,
              items: itemsAndValues()
            })
          }
        })
        .catch(err => {
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

    for (const key in items) {
      const item = items[key]
      data[key] = item.value
    }

    return data
  }

  const itemInitialize = item => {
    let itemValue = item.value || ''
    if (Object.prototype.hasOwnProperty.call(items, item.name)) {
      if (Object.prototype.hasOwnProperty.call(items[item.name], 'value')) {
        if (item.action === 'validations') {
          itemValue = items[item.name].value
        }
      }
    }
    if (item.opts.element === 'input' && item.opts.type === 'checkbox') {
      if (Object.prototype.hasOwnProperty.call(item, 'checked')) {
        itemValue = item.checked ? 'on' : 'off'
      }
    }

    const itemValidations = item.validations || []

    items[item.name] = {
      value: itemValue,
      validations: itemValidations
    }

    setInterestingBug(itemValue)

    const newItems = Object.assign({}, items)
    setItems(newItems)

    if (formIsValidating) formValidate()
  }

  const itemOnChange = opts => {
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

  const removeItems = itemsToRemove => {
    for (const key in items) {
      if (itemsToRemove.indexOf(key) !== -1) {
        delete items[key]
      }
    }
    setItems({ ...items })
  }

  const itemSet = opts => {
    if (opts) {
      const optsKeys = Object.keys(opts)
      const itemKeys = Object.keys(items)

      if (optsKeys.length) {
        for (const key in itemKeys) {
          const item = items[key]

          if (Object.prototype.hasOwnProperty.call(opts, key)) {
            item.value = opts[key]
          }
        }
      } else {
        for (const key in itemKeys) {
          const item = items[key]
          item.value = ''
        }
      }

      setItems(items)
    }
  }

  const runValidation = trueFalse => {
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
    removeItems,
    setItems: itemSet,
    state: { items }
  }

  return (
    <Context.Provider value={store}>
      {props.children}
    </Context.Provider>
  )
}

const connectProvider = Component => {
  return props => (
    <Provider>
      <Context.Consumer>
        {store => <Component {...props} store={store} />}
      </Context.Consumer>
    </Provider>
  )
}

const connectConsumer = Component => {
  return props => (
    <Context.Consumer>
      {store => <Component {...props} store={store} />}
    </Context.Consumer>
  )
}

const Form = connectProvider(_Form)
const Input = connectConsumer(_Input)
const Textarea = connectConsumer(_Textarea)
const Select = connectConsumer(_Select)

export {
  Form,
  Input,
  Textarea,
  Select
}
