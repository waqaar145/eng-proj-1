const expValidatorMsg = (data) => {
  if  (Array.isArray(data) && data.length > 0) {
    let errorObj = {}
    for (let e of data) {
      errorObj = {...errorObj, [e.param]: e.msg}
    }
    return errorObj;
  }
  return {}
}

module.exports = {
  expValidatorMsg
}