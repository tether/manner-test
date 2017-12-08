
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
    '/:name': query => 'hello ' + query.name,
    '/500': () => {
      throw new Error('this is some default error')
    },
    '/403': () => {
      const error = new Error('Unauthorized')
      error.status = 403
      return error
    }
  }
})

test('should proxy service method(s)', assert => {
  assert.plan(1)
  assert.equal(typeof service.get, 'function')
  //assert.equal(service.options == null, true)
})

test('should resolve method', assert => {
  assert.plan(2)
  service.get('/')
    .then(response => {
      assert.equal(response.status, 200)
      assert.equal(response.payload, 'hello')
    })
})

test('should resolve method with query parameters', assert => {
  assert.plan(2)
  service.post('/', {
    name: 'bob'
  })
    .then(response => {
      assert.equal(response.status, 200)
      assert.equal(response.payload, 'hello bob')
    })
})

test('should resolve method with route', assert => {
  assert.plan(2)
  service.post('/olivier')
    .then(response => {
      assert.equal(response.status, 200)
      assert.equal(response.payload, 'hello olivier')
    })
})

test('should reject methodthat throw error with default status', assert => {
  assert.plan(2)
  service.post('/500')
    .then(response => {
      assert.equal(response.status, 500)
      assert.equal(response.payload, 'this is some default error')
    })
})

test('should reject method that return error with specific status', assert => {
  assert.plan(2)
  service.post('/403')
    .then(response => {
      assert.equal(response.status, 403)
      assert.equal(response.payload, 'Unauthorized')
    })
})

test('should accept schema and return 400 if not validated', assert => {
  assert.plan(4)
  const service = manner({
    get(query, body) {
      return 'hello'
    }
  }, {
    get: {
      '/': {
        query: {
          email: {
            required: true
          },
          city: {
            validate(value) {
              return value === 'calgary'
            }
          }
        }
      }
    }
  })
  service.get('/', {
    city: 'calgary'
  }).then(res => assert.equal(res.status, 400))
  service.get('/', {
    email: 'haha@gmail.com',
    city: 'calgsary'
  }).then(res => assert.equal(res.status, 400))
  service.get('/', {
    email: 'haha@gmail.com',
    city: 'calgary'
  }).then(res => {
    assert.equal(res.status, 200)
    assert.equal(res.payload, 'hello')
  })
})
