Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports['default'] = hypernova;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* globals document */

var LEFT = '<!--';
var RIGHT = '-->';

var ENCODE = [['&', '&amp;'], ['>', '&gt;']];

var DATA_KEY = 'hypernova-key';
var DATA_ID = 'hypernova-id';

// https://gist.github.com/jed/982883
function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (x) {
    return (x ^ Math.random() * 16 >> x / 4).toString(16);
  });
}

function encode(obj) {
  return ENCODE.reduce(function (str, coding) {
    var _coding = _slicedToArray(coding, 2),
        encodeChar = _coding[0],
        htmlEntity = _coding[1];

    return str.replace(new RegExp(encodeChar, 'g'), htmlEntity);
  }, JSON.stringify(obj));
}

function decode(res) {
  var jsonPayload = ENCODE.reduceRight(function (str, coding) {
    var _coding2 = _slicedToArray(coding, 2),
        encodeChar = _coding2[0],
        htmlEntity = _coding2[1];

    return str.replace(new RegExp(htmlEntity, 'g'), encodeChar);
  }, res);

  return JSON.parse(jsonPayload);
}

function makeValidDataAttribute(attr, value) {
  var encodedAttr = attr.toLowerCase().replace(/[^0-9a-z_-]/g, '');
  var encodedValue = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return 'data-' + String(encodedAttr) + '="' + String(encodedValue) + '"';
}

function toScript(attrs, data) {
  var dataAttributes = Object.keys(attrs).map(function (name) {
    return makeValidDataAttribute(name, attrs[name]);
  });
  return '<script type="application/json" ' + String(dataAttributes.join(' ')) + '>' + LEFT + String(encode(data)) + RIGHT + '</script>'; // eslint-disable-line max-len
}

function fromScript(attrs) {
  var selectors = Object.keys(attrs).map(function (name) {
    return '[' + String(makeValidDataAttribute(name, attrs[name])) + ']';
  }).join('');
  var node = document.querySelector('script' + String(selectors));
  if (!node) return null;
  var jsonPayload = node.innerHTML;

  return decode(jsonPayload.slice(LEFT.length, jsonPayload.length - RIGHT.length));
}

function serialize(name, html, data) {
  var _toScript;

  var key = name.replace(/\W/g, '');
  var id = uuid();
  var markup = '<div data-' + DATA_KEY + '="' + String(key) + '" data-' + DATA_ID + '="' + String(id) + '">' + String(html) + '</div>';
  var script = toScript((_toScript = {}, _defineProperty(_toScript, DATA_KEY, key), _defineProperty(_toScript, DATA_ID, id), _toScript), data);
  return markup + '\n' + String(script);
}

function load(name) {
  var key = name.replace(/\W/g, '');
  var nodes = document.querySelectorAll('div[data-' + DATA_KEY + '="' + String(key) + '"]');

  return Array.prototype.map.call(nodes, function (node) {
    var _fromScript;

    var id = node.getAttribute('data-' + DATA_ID);
    var data = fromScript((_fromScript = {}, _defineProperty(_fromScript, DATA_KEY, key), _defineProperty(_fromScript, DATA_ID, id), _fromScript));
    return { node: node, data: data };
  });
}

function hypernova(runner) {
  return typeof window === 'undefined' ? runner.server() : runner.client();
}

hypernova.toScript = toScript;
hypernova.fromScript = fromScript;
hypernova.serialize = serialize;
hypernova.load = load;
module.exports = exports['default'];