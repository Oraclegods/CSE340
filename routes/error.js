const express = require("express")
const router = express.Router()

router.get("/trigger-error", (req, res, next) => {
  throw new Error("Intentional Server Error!")
})

module.exports = router
