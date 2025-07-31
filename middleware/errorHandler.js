function handleErrors(err, req, res, next) {
  console.error(err.stack)
  res.status(500).render("error", { title: "Server Error", message: err.message })
}

module.exports = handleErrors

