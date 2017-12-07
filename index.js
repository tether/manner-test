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
        let value
        try {
          value = method(path, query, data)
          if (value instanceof Error) value = Promise.reject(value)
        } catch (e) {
          value = Promise.reject(e)
        }
        return bluff(value)
          .then(value => {
            return {
              status: 200,
              payload: value
            }
          }, reason => {
            return Promise.reject({
              status: reason.status || 500,
              payload: reason.message
            })
          })
      }
    }
  })
}
