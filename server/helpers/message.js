const okResponse = (data, message="Success") => {
  return {
    message,
    data
  }
}

const errorResponse = (data, message="Failed") => {
  return {
    message,
    data
  }
}

module.exports = {
  okResponse,
  errorResponse
}