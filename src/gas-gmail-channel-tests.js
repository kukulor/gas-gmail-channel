function gmailChannelTestRunner() {
  'use strict'
  /**
  *
  * GmailChannel - Pub/Sub & Middleware framework for easy dealing with Gmails by Channel
  *
  * GmailChannel provide a easy way to filter out the emails in gmail by search options to a named Channel, 
  * then you could Sub to this Channel, and use Middleware to process them.
  *
  * Github - https://github.com/zixia/gas-gmail-channel
  *
  * Example:
  ```javascript
  if ((typeof GmailChannel)==='undefined') { // GmailChannel Initialization. (only if not initialized yet.)
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/zixia/gas-gmail-channel/master/src/gas-gmail-channel-lib.js').getContentText())
  } // Class GmailChannel is ready for use now!

  var testChannel = new GmailChannel({
    keywords: ['the']
    , labels: ['inbox']
    , limit: 1
    , doneLabel: 'OutOfGmailChannel'
  })

  testChannel.use(
    function (req, res, next) {
      Logger.log(req.thread.getFirstMessageSubject())
      req.data = 'set'
      next()
    }
    , function (req, res, next) {
      Logger.log('req.data got: ' + req.data)
      // NO next() here
    }
    , function (req, res,next) {
      throw Error('should not run to here')
    }
  )
  
  testChannel.done()
  ```
  */
  
  if ((typeof GasTap)==='undefined') { // GasT Initialization. (only if not initialized yet.)
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/zixia/gast/master/src/gas-tap-lib.js').getContentText())
  } // Class GasTap is ready for use now!
  
  var test = new GasTap()
  
  if ((typeof GmailChannel)==='undefined') { // GmailChannel Initialization. (only if not initialized yet.)
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/zixia/gas-gmail-channel/master/src/gas-gmail-channel-lib.js').getContentText())
  } // Class GmailChannel is ready for use now!

  test('Query string', function (t) {
    
    var EXPECTED_QUERY_STRING = ' newer_than:1d -label:OutOfGmailChannel 融资申请 最简单的创业计划书 '
    + '-abcdefghijklmnopqrstuvwxyz -label:trash'
    var testChannel = new GmailChannel({
      keywords: [
        '融资申请'
        , '最简单的创业计划书'
        , '-abcdefghijklmnopqrstuvwxyz'
      ]
      , labels: [
        ''
        , '-' + 'trash'
      ]
      , dayspan: '1' 
      , query: ''
      , doneLabel: 'OutOfGmailChannel'
    })
    t.equal(testChannel.getQueryString(), EXPECTED_QUERY_STRING, 'query string built')
    
  })
  
  test('Middleware chains', function (t) {
    var EXPECTED_MIDDLEWARES_NUM = 3
    var RES_DATA_EXPECTED = 'res data set in constructor'
    var RES_DATA_GOTTEN = ''
    var REQ_DATA_EXPECTED = 'req data set set in middleware'
    var REQ_DATA_GOTTEN = ''
    var COUNTER = 0
    var testChannel = new GmailChannel({
      limit: 1
      , res: {
        data: RES_DATA_EXPECTED
      }
    })    
    testChannel.use(
      function (req, res, next) {
        req.data = REQ_DATA_EXPECTED
        COUNTER++;
        next()
      }
      , function (req, res, next) {
        REQ_DATA_GOTTEN = req.data
        RES_DATA_GOTTEN = res.data
        COUNTER++;
        // NO next() here!
      }
      , function (req, res, next) {
        COUNTER++;
        next()
      }
    )
    t.equal(testChannel.getMiddlewares().length, EXPECTED_MIDDLEWARES_NUM, 'num of middlewares function is 3')
    testChannel.done()
    t.equal(COUNTER, 2, '1 next to 2, but 2 not next to 3')
    t.equal(REQ_DATA_GOTTEN, REQ_DATA_EXPECTED, 'req.data right')
    t.equal(RES_DATA_GOTTEN, RES_DATA_EXPECTED, 'res.data right')
  })
}