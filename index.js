/**
 * Dependencies.
 */

const bluff = require('bluff')


/**
 * Mock up HTTP response as returned by
 * a manner service.
 *
 * @param {Object} service (manner's service)
 * @api public
 */

module.exports = function (service) {
  return new Proxy({}, {
    get(target, key, receiver) {
      const method = service[key]
      return (path, query, data) => {
        return bluff(method(path, query, data))
      }
    }
  })
}
