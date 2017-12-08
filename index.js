/**
 * Dependencies.
 */

const bluff = require('bluff')
const manner = require('manner')
const isokay = require('isokay')
const passover = require('passover')

/**
 * Mock up HTTP response as returned by
 * a manner service.
 *
 * @param {Object} service (manner's service)
 * @param {Object} schema
 * @api public
 */

module.exports = function (service, schema = {}) {
  const options = passover(schema)
  return new Proxy(manner(service), {
    get(target, key, receiver) {
      const method = target[key]
      return (path, query, data) => {
        const schema = options(key, path)
        return Promise.all([
            isokay(query, schema && schema.query),
            isokay(data, schema && schema.body)
          ])
          .then(values =>  {
            return bluff(salute(method.bind(null, path, values[0], values[1])))
          }, err => {
            // manage errors coming from isokay
            return Promise.reject({
              status: 400,
              message: err.message
            })
          })
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
        // return bluff(salute(method.bind(null, path, query, data)))
        //   .then(value => {
        //     return {
        //       status: 200,
        //       payload: value
        //     }
        //   }, reason => {
        //     return Promise.resolve({
        //       status: reason.status || 500,
        //       payload: reason.message
        //     })
        //   })
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
