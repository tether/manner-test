/**
 * Dependencies.
 */

const bluff = require('bluff')
const manner = require('manner')

/**
 * Mock up HTTP response as returned by
 * a manner service.
 *
 * @param {Object} service (manner's service)
 * @api public
 */

module.exports = function (service) {
  return new Proxy(manner(service), {
    get(target, key, receiver) {
      const method = target[key]
      return (path, query, data) => {
        return bluff(salute(method.bind(null, path, query, data)))
          .then(value => {
            return {
              status: 200,
              payload: value
            }
          }, reason => {
            return Promise.resolve({
              status: reason.status || 500,
              payload: reason.message
            })
          })
      }
    }
  })
}


/**
 * Simulate salute behavious.
 *
 * @param {Function} cb
 * @see https://github.com/bredele/salute
 * @api private
 */

function salute (cb) {
  let value
  try {
    value = cb()
    if (value instanceof Error) value = Promise.reject(value)
  } catch (e) {
    value = Promise.reject(e)
  }
  return value
}
