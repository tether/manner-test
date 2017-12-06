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
        return bluff(method(path, query, data))
      }
    }
  })
}
