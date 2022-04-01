var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/* eslint react/jsx-fragments: 0 */

import React, { Fragment, useEffect, useState } from 'react';
import validator from 'validator';
import axios from 'axios';

const _Form = props => {
  const { runValidation, preSubmit, onSubmit, postSubmit, removeItems, postOptions, store } = props,
        htmlProps = _objectWithoutProperties(props, ['runValidation', 'preSubmit', 'onSubmit', 'postSubmit', 'removeItems', 'postOptions', 'store']);

  useEffect(() => {
    store.runValidation(runValidation);
  }, [runValidation]);

  useEffect(() => {
    if (typeof removeItems !== 'undefined' && removeItems.length) {
      store.removeItems(removeItems);
    }
  }, [removeItems]);

  return React.createElement(
    'form',
    _extends({
      noValidate: true
    }, htmlProps, {
      onSubmit: e => store.formOnSubmit({ preSubmit, onSubmit, postSubmit, postOptions }, e)
    }),
    props.children
  );
};

const Item = props => {
  const { opts, store, validations, className, onChange } = props,
        htmlProps = _objectWithoutProperties(props, ['opts', 'store', 'validations', 'className', 'onChange']);

  useEffect(() => {
    store.itemInitialize(props);
  }, [props.value]);

  useEffect(() => {
    store.itemInitialize(_extends({}, props, { action: 'validations' }));
  }, [validations]);

  const thisItem = store.state.items[props.name] || {
    value: '',
    className: '',
    invalidFeedback: ''
  };

  const itemClassName = (className || '') + (thisItem.className ? (className ? ' ' : '') + thisItem.className : '');

  let formElement;
  if (opts.element === 'input') {
    if (opts.type === 'checkbox') {
      formElement = React.createElement('input', _extends({}, htmlProps, {
        value: thisItem.value,
        className: itemClassName,
        checked: thisItem.value === 'on',
        onChange: e => store.itemOnChange({ props, e, onChange })
      }));
    } else {
      formElement = React.createElement('input', _extends({}, htmlProps, {
        value: thisItem.value,
        className: itemClassName,
        onChange: e => store.itemOnChange({ props, e, onChange })
      }));
    }
  } else if (opts.element === 'textarea') {
    formElement = React.createElement('textarea', _extends({}, htmlProps, {
      value: thisItem.value,
      className: itemClassName,
      onChange: e => store.itemOnChange({ props, e, onChange })
    }));
  } else if (opts.element === 'select') {
    formElement = React.createElement(
      'select',
      _extends({}, htmlProps, {
        value: thisItem.value,
        className: itemClassName,
        onChange: e => store.itemOnChange({ props, e, onChange })
      }),
      props.children
    );
  }

  return React.createElement(
    Fragment,
    null,
    formElement,
    thisItem.invalidFeedback ? React.createElement(
      'div',
      { className: 'invalid-feedback' },
      thisItem.invalidFeedback
    ) : null
  );
};

const _Input = props => React.createElement(Item, _extends({}, props, { opts: { element: 'input', type: props.type } }));
const _Textarea = props => React.createElement(Item, _extends({}, props, { opts: { element: 'textarea' } }));
const _Select = props => React.createElement(Item, _extends({}, props, { opts: { element: 'select' } }));

const Context = React.createContext();

const Provider = props => {
  const [items, setItems] = useState({});
  const [interestingBug, setInterestingBug] = useState('');
  const [formIsValidating, setFormIsValidating] = useState(false);

  const itemValidate = opts => {
    const item = items[opts.name];

    for (const key in item.validations) {
      const itemValidation = item.validations[key];
      const validate = validator[itemValidation.rule](item.value, itemValidation.args);
      if (validate) {
        itemValidation.validated = true;
      } else {
        itemValidation.validated = false;
      }
    }

    const unvalidatedItems = [];
    for (const key in item.validations) {
      const itemValidation = item.validations[key];
      if (!itemValidation.validated) {
        unvalidatedItems.push(itemValidation);
      }
    }

    item.validated = !unvalidatedItems.length || false;
  };

  const formUnvalidate = () => {
    for (const key in items) {
      const item = items[key];
      item.className = '';
    }
    setItems(items);
  };

  const formValidate = () => {
    let howManyItemsValidated = 0;
    let howManyItemsAreGonnaValidate = 0;

    for (const key in items) {
      const item = items[key];

      for (const key in item.validations) {
        const itemValidation = item.validations[key];
        howManyItemsAreGonnaValidate++;

        const validate = validator[itemValidation.rule](item.value, itemValidation.args);
        if (validate) {
          itemValidation.validated = true;
          howManyItemsValidated++;
        } else {
          itemValidation.validated = false;
        }
      }

      const unvalidatedItems = [];
      for (const key in item.validations) {
        const itemValidation = item.validations[key];
        if (!itemValidation.validated) {
          unvalidatedItems.push(itemValidation);
        }
      }

      if (unvalidatedItems.length) {
        item.invalidFeedback = unvalidatedItems[0].invalidFeedback;
        item.className = 'is-invalid';
      }
    }

    setItems(items);

    return howManyItemsAreGonnaValidate === howManyItemsValidated || false;
  };

  const formOnSubmit = (opts, e) => {
    e.preventDefault();

    if (opts.preSubmit) {
      opts.preSubmit({
        e,
        removeItems,
        setItems: itemSet,
        items: itemsAndValues()
      });
    }

    setFormIsValidating(true);

    const isFormValid = formValidate();

    if (opts.onSubmit) {
      opts.onSubmit({
        e,
        removeItems,
        setItems: itemSet,
        items: itemsAndValues(),
        isFormValid: isFormValid
      });
    }

    if (isFormValid && opts.postOptions) {
      opts.postOptions.data = itemsAndValues();

      axios(_extends({}, opts.postOptions)).then(res => {
        const validations = res.data.validations || {};

        let isPostSubmitFormValid = true;
        if (Object.keys(validations).length) {
          isPostSubmitFormValid = false;

          for (const key in validations) {
            const validation = validations[key];
            items[key].invalidFeedback = validation;
            items[key].className = 'is-invalid';
          }

          const newItems = Object.assign({}, items);
          setItems(newItems);
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
          });
        }
      }).catch(err => {
        if (opts.postSubmit) {
          opts.postSubmit({
            error: err,
            isFormValid,
            setItems: itemSet,
            items: itemsAndValues()
          });
        }
      });
    }
  };

  const itemsAndValues = () => {
    const data = {};

    for (const key in items) {
      const item = items[key];
      data[key] = item.value;
    }

    return data;
  };

  const itemInitialize = item => {
    let itemValue = item.value || '';
    if (Object.prototype.hasOwnProperty.call(items, item.name)) {
      if (Object.prototype.hasOwnProperty.call(items[item.name], 'value')) {
        if (item.action === 'validations') {
          itemValue = items[item.name].value;
        }
      }
    }
    if (item.opts.element === 'input' && item.opts.type === 'checkbox') {
      if (Object.prototype.hasOwnProperty.call(item, 'checked')) {
        itemValue = item.checked ? 'on' : 'off';
      }
    }

    const itemValidations = item.validations || [];

    items[item.name] = {
      value: itemValue,
      validations: itemValidations
    };

    setInterestingBug(itemValue);

    const newItems = Object.assign({}, items);
    setItems(newItems);

    if (formIsValidating) formValidate();
  };

  const itemOnChange = opts => {
    const item = _extends({}, opts.props, {
      checked: opts.e.target.checked,
      value: opts.e.target.value
    });

    itemInitialize(item);

    if (opts.onChange) {
      itemValidate({ name: opts.props.name });
      opts.onChange({ e: opts.e, validated: items[opts.props.name].validated });
    }
  };

  const removeItems = itemsToRemove => {
    for (const key in items) {
      if (itemsToRemove.indexOf(key) !== -1) {
        delete items[key];
      }
    }
    setItems(_extends({}, items));
  };

  const itemSet = opts => {
    if (opts) {
      const optsKeys = Object.keys(opts);
      const itemKeys = Object.keys(items);

      if (optsKeys.length) {
        for (const key in itemKeys) {
          const itemKey = itemKeys[key];
          const item = items[itemKey];

          if (Object.prototype.hasOwnProperty.call(opts, itemKey)) {
            item.value = opts[itemKey];
          }
        }
      } else {
        for (const key in itemKeys) {
          const itemKey = itemKeys[key];
          const item = items[itemKey];
          item.value = '';
        }
      }

      setItems(_extends({}, items));
    }
  };

  const runValidation = trueFalse => {
    setFormIsValidating(trueFalse);
    if (trueFalse) {
      formValidate();
    } else {
      formUnvalidate();
    }
  };

  const store = {
    formOnSubmit,
    itemInitialize,
    itemOnChange,
    runValidation,
    removeItems,
    setItems: itemSet,
    state: { items }
  };

  return React.createElement(
    Context.Provider,
    { value: store },
    props.children
  );
};

const connectProvider = Component => {
  return props => React.createElement(
    Provider,
    null,
    React.createElement(
      Context.Consumer,
      null,
      store => React.createElement(Component, _extends({}, props, { store: store }))
    )
  );
};

const connectConsumer = Component => {
  return props => React.createElement(
    Context.Consumer,
    null,
    store => React.createElement(Component, _extends({}, props, { store: store }))
  );
};

const Form = connectProvider(_Form);
const Input = connectConsumer(_Input);
const Textarea = connectConsumer(_Textarea);
const Select = connectConsumer(_Select);

export { Form, Input, Textarea, Select };

