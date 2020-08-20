function attachLocals (req, res, next) {
  res.locals.context = req.context
  next()
}

module.exports = attachLocals
