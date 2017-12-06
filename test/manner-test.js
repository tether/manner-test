
/**
 * Test dependencies.
 */

const test = require('tape')
const manner = require('..')


/**
 * Create test service.
 * @type {Function}
 */

const service = manner({
  get() {
    return 'hello'
  }
})


test('should return an object containing service method(s)', assert => {
  assert.plan(1)
  assert.equal(typeof service.get, 'function')
  assert.equal(service.options == null, true)
})
