
function lastResortErrorHandler (err, req, res, next) {
  const traceId = req.context ? req.context.traceId : 'none'
  console.error(traceId, err)

  res.status(500).send('error')
}

module.exports = lastResortErrorHandler
