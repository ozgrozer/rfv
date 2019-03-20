'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var Form = function Form(props) {
  var preSubmit = props.preSubmit,
      _onSubmit = props.onSubmit,
      postSubmit = props.postSubmit,
      postOptions = props.postOptions,
      store = props.store,
      htmlProps = _objectWithoutProperties(props, ['preSubmit', 'onSubmit', 'postSubmit', 'postOptions', 'store']);

  return _react2.default.createElement(
    'form',
    _extends({
      noValidate: true
    }, htmlProps, {
      onSubmit: function onSubmit(e) {
        return store.formOnSubmit({ preSubmit: preSubmit, onSubmit: _onSubmit, postSubmit: postSubmit, postOptions: postOptions }, e);
      } }),
    props.children
  );
};

var Item = function Item(props) {
  var opts = props.opts,
      store = props.store,
      validations = props.validations,
      className = props.className,
      _onChange = props.onChange,
      htmlProps = _objectWithoutProperties(props, ['opts', 'store', 'validations', 'className', 'onChange']);

  (0, _react.useEffect)(function () {
    store.itemInitialize(props);
  }, [props.value]);

  var thisItem = store.state.items[props.name] || {
    value: '',
    className: '',
    invalidFeedback: ''
  };

  var itemClassName = (className || '') + (thisItem.className ? (className ? ' ' : '') + thisItem.className : '');

  var formElement = void 0;
  if (opts.element === 'input') {
    if (opts.type === 'checkbox') {
      formElement = _react2.default.createElement('input', _extends({}, htmlProps, {
        value: thisItem.value,
        className: itemClassName,
        checked: thisItem.value === 'on' || false,
        onChange: function onChange(e) {
          return store.itemOnChange({ props: props, e: e, onChange: _onChange });
        } }));
    } else {
      formElement = _react2.default.createElement('input', _extends({}, htmlProps, {
        value: thisItem.value,
        className: itemClassName,
        onChange: function onChange(e) {
          return store.itemOnChange({ props: props, e: e, onChange: _onChange });
        } }));
    }
  } else if (opts.element === 'textarea') {
    formElement = _react2.default.createElement('textarea', _extends({}, htmlProps, {
      value: thisItem.value,
      className: itemClassName,
      onChange: function onChange(e) {
        return store.itemOnChange({ props: props, e: e, onChange: _onChange });
      } }));
  } else if (opts.element === 'select') {
    formElement = _react2.default.createElement(
      'select',
      _extends({}, htmlProps, {
        value: thisItem.value,
        className: itemClassName,
        onChange: function onChange(e) {
          return store.itemOnChange({ props: props, e: e, onChange: _onChange });
        } }),
      props.children
    );
  }

  return _react2.default.createElement(
    _react.Fragment,
    null,
    formElement,
    thisItem.invalidFeedback ? _react2.default.createElement(
      'div',
      { className: 'invalid-feedback' },
      thisItem.invalidFeedback
    ) : null
  );
};

var Input = function Input(props) {
  return _react2.default.createElement(Item, _extends({}, props, { opts: { element: 'input', type: props.type } }));
};
var Textarea = function Textarea(props) {
  return _react2.default.createElement(Item, _extends({}, props, { opts: { element: 'textarea' } }));
};
var Select = function Select(props) {
  return _react2.default.createElement(Item, _extends({}, props, { opts: { element: 'select' } }));
};

var Context = _react2.default.createContext();

var Provider = function Provider(props) {
  var _useState = (0, _react.useState)({}),
      _useState2 = _slicedToArray(_useState, 2),
      items = _useState2[0],
      setItems = _useState2[1];

  var _useState3 = (0, _react.useState)(false),
      _useState4 = _slicedToArray(_useState3, 2),
      formIsValidating = _useState4[0],
      setFormIsValidating = _useState4[1];

  var itemValidate = function itemValidate(opts) {
    var item = items[opts.name];

    item.validations.map(function (itemValidation, i) {
      var validate = _validator2.default[itemValidation.rule](item.value, itemValidation.args);
      if (validate) {
        itemValidation.validated = true;
      } else {
        itemValidation.validated = false;
      }
    });

    var unvalidatedItems = [];
    item.validations.map(function (itemValidation, i) {
      if (!itemValidation.validated) {
        unvalidatedItems.push(itemValidation);
      }
    });

    item.validated = !unvalidatedItems.length || false;
  };

  var formValidate = function formValidate() {
    var howManyItemsValidated = 0;
    var howManyItemsAreGonnaValidate = 0;

    Object.keys(items).map(function (key) {
      var item = items[key];

      item.validations.map(function (itemValidation, i) {
        howManyItemsAreGonnaValidate++;

        var validate = _validator2.default[itemValidation.rule](item.value, itemValidation.args);
        if (validate) {
          itemValidation.validated = true;
          howManyItemsValidated++;
        } else {
          itemValidation.validated = false;
        }
      });

      var unvalidatedItems = [];
      item.validations.map(function (itemValidation, i) {
        if (!itemValidation.validated) {
          unvalidatedItems.push(itemValidation);
        }
      });

      if (unvalidatedItems.length) {
        item.invalidFeedback = unvalidatedItems[0].invalidFeedback;
        item.className = 'is-invalid';
      }
    });

    setItems(items);

    return howManyItemsAreGonnaValidate === howManyItemsValidated || false;
  };

  var formOnSubmit = function formOnSubmit(opts, e) {
    e.preventDefault();

    if (opts.preSubmit) {
      opts.preSubmit({
        setItems: itemSet,
        items: itemsAndValues()
      });
    }

    setFormIsValidating(true);

    var isFormValid = formValidate();

    if (opts.onSubmit) {
      opts.onSubmit({
        setItems: itemSet,
        items: itemsAndValues(),
        isFormValid: isFormValid
      });
    }

    if (isFormValid && opts.postOptions) {
      opts.postOptions.data = itemsAndValues();

      (0, _axios2.default)(_extends({}, opts.postOptions)).then(function (res) {
        var validations = res.data.validations || {};

        var isPostSubmitFormValid = true;
        if (Object.keys(validations).length) {
          isPostSubmitFormValid = false;

          Object.keys(validations).map(function (key) {
            items[key].invalidFeedback = validations[key];
            items[key].className = 'is-invalid';
          });

          setItems(items);
        }

        if (opts.postSubmit) {
          opts.postSubmit({
            isFormValid: isFormValid,
            data: res.data,
            setItems: itemSet,
            isPostSubmitFormValid: isPostSubmitFormValid,
            items: itemsAndValues()
          });
        }
      }).catch(function (err) {
        if (opts.postSubmit) {
          opts.postSubmit({
            error: err,
            isFormValid: isFormValid,
            setItems: itemSet,
            items: itemsAndValues()
          });
        }
      });
    }
  };

  var itemsAndValues = function itemsAndValues() {
    var data = {};

    Object.keys(items).map(function (key) {
      var item = items[key];
      data[key] = item.value;
    });

    return data;
  };

  var itemInitialize = function itemInitialize(item) {
    var itemValue = item.value || '';
    if (item.opts.element === 'input' && item.opts.type === 'checkbox') {
      itemValue = item.checked ? 'on' : 'off';
    }

    items[item.name] = {
      value: itemValue,
      validations: item.validations || []
    };

    setItems(items);

    if (formIsValidating) formValidate();
  };

  var itemOnChange = function itemOnChange(opts) {
    var item = _extends({}, opts.props, {
      checked: opts.e.target.checked,
      value: opts.e.target.value
    });

    itemInitialize(item);

    if (opts.onChange) {
      itemValidate({ name: opts.props.name });
      opts.onChange({ e: opts.e, validated: items[opts.props.name].validated });
    }
  };

  var itemSet = function itemSet(opts) {
    if (opts) {
      var optsKeys = Object.keys(opts);
      var itemKeys = Object.keys(items);

      if (optsKeys.length) {
        itemKeys.map(function (key) {
          var item = items[key];

          if (opts.hasOwnProperty(key)) {
            item.value = opts[key];
          }
        });
      } else {
        itemKeys.map(function (key) {
          var item = items[key];
          item.value = '';
        });
      }

      setItems(items);
    }
  };

  var store = {
    formOnSubmit: formOnSubmit,
    itemInitialize: itemInitialize,
    itemOnChange: itemOnChange,
    setItems: itemSet,
    state: { items: items }
  };

  return _react2.default.createElement(
    Context.Provider,
    { value: store },
    props.children
  );
};

var connectProvider = function connectProvider(Component) {
  return function (props) {
    return _react2.default.createElement(
      Provider,
      null,
      _react2.default.createElement(
        Context.Consumer,
        null,
        function (store) {
          return _react2.default.createElement(Component, _extends({}, props, { store: store }));
        }
      )
    );
  };
};

var connectConsumer = function connectConsumer(Component) {
  return function (props) {
    return _react2.default.createElement(
      Context.Consumer,
      null,
      function (store) {
        return _react2.default.createElement(Component, _extends({}, props, { store: store }));
      }
    );
  };
};

module.exports = {
  Form: connectProvider(Form),
  Input: connectConsumer(Input),
  Textarea: connectConsumer(Textarea),
  Select: connectConsumer(Select)
};

