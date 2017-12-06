
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
  },
  post: {
    '/': query => 'hello ' + query.name,
    '/:name': query => 'hello ' + query.name
  }
})

test('should proxy service method(s)', assert => {
  assert.plan(1)
  assert.equal(typeof service.get, 'function')
  //assert.equal(service.options == null, true)
})

test('should call method', assert => {
  assert.plan(2)
  service.get('/')
    .then(response => {
      assert.equal(response.status, 200)
      assert.equal(response.payload, 'hello')
    })
})

test('should call method with query parameters', assert => {
  assert.plan(2)
  service.post('/', {
    name: 'bob'
  })
    .then(response => {
      assert.equal(response.status, 200)
      assert.equal(response.payload, 'hello bob')
    })
})

test('should call method with route', assert => {
  assert.plan(2)
  service.post('/olivier')
    .then(response => {
      assert.equal(response.status, 200)
      assert.equal(response.payload, 'hello olivier')
    })
})
