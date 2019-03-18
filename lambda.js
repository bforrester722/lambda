
// partial application
// func -> func
const curry = func => {
  const arity   = func.length;
  const curried = (...a) => a.length >= arity ? func(...a) : (...b) => curried(...a, ...b);
  return curried;                                      
};
// long form
// const curry = func => {
//  const arity   = func.length;
//  const curried = (...args) => {
//    const enoughArgs = args.length >= arity;
//    if (enoughArgs) {
//      return func(...args);
//    }
//    return (...newArgs) => curried(...args, ...newArgs);
//  };
//  return curried;
// };

// chain multiple pure functions together
// funcs -> func
const compose = (...funcs) => {
  const arity = funcs.length;
  if (arity === 0) { return; }

  const foundNonFunction = funcs.find(func => typeof func !== 'function');
  if (foundNonFunction) { throw new Error('compose only accepts functions as arguments'); }

  return (x, ...rest) => {
    if (rest.length > 0) { throw new Error('a composed function can only accept one argument'); }
    // work array last to first
    const index = arity - 1;

    if (index === 0) { return funcs[0](x); }
    // const run = (f, g, i) => i === 0 ? f(g(x)) : f(run(g, funcs[i - 1], i - 1));
    const run = (f, g, i) => {
      if (i === 0) {
        return f(g(x));
      }
      return f(run(g, funcs[i - 1], i - 1));
    };

    return run(funcs[index], funcs[index - 1], index - 1);
  };
};

// func -> func return value
const memoize = func => {
  if (typeof func !== 'function') { return new TypeError('memoize only accepts a function'); }
  const cache = {};
  return (...args) => {
    const argStr  = JSON.stringify(args);
    cache[argStr] = cache[argStr] || func(...args);
    return cache[argStr];
  };
};

// str, anyType -> anyType
const trace = curry((tag, x) => {
  console.log(tag, x); // eslint-disable-line no-console
  return x;
});

// array2D -> array
const flatten = (arrays, depth = 1) => arrays.flat(depth);

// func, functor -> array
const map = curry((func, array) => array.map(func));

// func, array2D -> array 
const flatmap = curry((func, arrays) => arrays.flatMap(func));

// str -> array
const letters   = str   => str.split('');
// array -> item
const head      = array => array[0];
// array -> item
const tail      = array => array[array.length - 1];
// str -> str
const upperCase = str   => str.toUpperCase();
// str, str -> array
const split     = curry((separator, str) => str.split(separator));
// str, array -> str
const join      = curry((joiner, array)  => array.join(joiner));
// num, array -> array
const take      = curry((end, array)     => array.slice(0, end));
// num, array -> array
const rest      = curry((start, array)   => array.slice(start));
// pure pop implementation
const pop = array => {
  const [first, ...rest] = array.reverse();
  return rest.reverse();
};
// pure push implementation
const push = curry((array, element) => [...array, element]);
// pure shift implementation
const shift = array => {
  const [first, ...rest] = array;
  return rest;
};
// pure splice implementation
// args reordered for composition
// insert: Array
// remove: Number
// index: Number
const splice = curry((insert, remove, index, array) => {
  if (typeof index !== 'number') { throw new TypeError('splice index must be a number'); }
  if (!Array.isArray(array)) { throw new TypeError('splice array must be an array'); }
  const inserted  = insert || [];
  const removed   = remove || 1;
  const beginning = array.slice(0, index); 
  const end       = array.slice(index + removed);
  return [...beginning, ...inserted, ...end];
});

// delete one item from an array
const removeOne = splice(undefined, 1);

// str -> str
const capitalize = str => {
  if (!str) { return str; }
  const capFirst = compose(letters, head,    upperCase);
  const getRest  = compose(letters, rest(1), join(''));
  const first    = capFirst(str);
  const end      = getRest(str);
  return `${first}${end}`;
};

// String or Number -> String
const currency = (num, type = 'USD') => 
  Number(num).
    toFixed(2).
    toLocaleString(undefined, {
      style:   'currency', 
      currency: type
    });
// accepts number strings or numbers
// calculates taxes and total after taxes
// taxRate is the tax percentage ie 8.25
const calcPrice = curry((taxRate, subTot) => {
  const taxDecimal   = Number(taxRate) / 100;
  const taxTot       = Number(subTot) * taxDecimal;
  const totalInt     = Number(subTot) * (100 + (taxDecimal * 100));
  const totalDecimal = Math.round(totalInt) / 100;
  const total        = currency(totalDecimal);
  const tax          = currency(taxTot);
  const subtotal     = currency(subTot);
  return {subtotal, tax, total};
});

// output is forced between a min and max
const clamp = curry((min, max, num) => Math.min(Math.max(num, min), max));

// obj -> obj
const deepClone = obj => JSON.parse(JSON.stringify(obj));

// use a path string (ie. 'shipping.dimensions.height')
// to read a val in a nested object
const accessByPath = curry((path, obj) => {
  const keys = path.split('.');
  return keys.reduce((accum, key) => accum[key], obj);
});


export {
  accessByPath,
  calcPrice,
  capitalize,
  clamp,
  compose,
  currency,
  curry,
  deepClone,
  flatten, 
  flatmap,
  head,
  join,
  letters,
  map,
  memoize,
  pop,
  push,
  removeOne,
  rest,
  shift,
  splice,
  split,
  tail,
  take,
  trace,
  upperCase
};
