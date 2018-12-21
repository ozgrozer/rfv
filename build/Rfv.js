'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var Form = function Form(props) {
  var store = props.store,
      postUrl = props.postUrl,
      className = props.className,
      onChange = props.onChange,
      htmlProps = _objectWithoutProperties(props, ['store', 'postUrl', 'className', 'onChange']);

  return _react2.default.createElement(
    'form',
    _extends({}, htmlProps, {
      onSubmit: store.formOnSubmit }),
    props.children
  );
};

var Item = function Item(props) {
  var opts = props.opts,
      store = props.store,
      validations = props.validations,
      className = props.className,
      onChange = props.onChange,
      htmlProps = _objectWithoutProperties(props, ['opts', 'store', 'validations', 'className', 'onChange']);

  (0, _react.useEffect)(function () {
    store.itemInitialize(props);
  }, [props.value]);

  var thisItem = store.state.items[props.name] || {
    value: '',
    invalidFeedback: ''
  };

  var formElement = void 0;
  if (opts.element === 'input') {
    formElement = _react2.default.createElement('input', _extends({}, htmlProps, {
      value: thisItem.value,
      onChange: function onChange(e) {
        return store.itemOnChange(props, e);
      } }));
  } else if (opts.element === 'textarea') {
    formElement = _react2.default.createElement('textarea', _extends({}, htmlProps, {
      value: thisItem.value,
      onChange: function onChange(e) {
        return store.itemOnChange(props, e);
      } }));
  } else if (opts.element === 'select') {
    formElement = _react2.default.createElement(
      'select',
      _extends({}, htmlProps, {
        value: thisItem.value,
        onChange: function onChange(e) {
          return store.itemOnChange(props, e);
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
      null,
      thisItem.invalidFeedback
    ) : null
  );
};

var Input = function Input(props) {
  return _react2.default.createElement(Item, _extends({}, props, { opts: { element: 'input' } }));
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

      item.invalidFeedback = unvalidatedItems.length ? unvalidatedItems[0].invalidFeedback : '';
    });

    setItems(items);

    if (howManyItemsAreGonnaValidate === howManyItemsValidated) {
      return true;
    }
  };

  var formOnSubmit = function formOnSubmit(e) {
    e.preventDefault();

    setFormIsValidating(true);

    if (formValidate()) {
      console.log('form is valid');
    } else {
      console.log('form is not valid');
    }
  };

  var itemInitialize = function itemInitialize(item) {
    items[item.name] = {
      value: item.value || '',
      validations: item.validations || []
    };

    setItems(items);

    if (formIsValidating) formValidate();
  };

  var itemOnChange = function itemOnChange(props, e) {
    var item = _extends({}, props, {
      value: e.target.value
    });

    itemInitialize(item);
  };

  var store = {
    formOnSubmit: formOnSubmit,
    itemInitialize: itemInitialize,
    itemOnChange: itemOnChange,
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

