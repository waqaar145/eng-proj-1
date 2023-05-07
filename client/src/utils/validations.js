const letters = /^[A-Za-z]+$/;
const alphaNumeric = /^[a-zA-Z0-9_]+$/;
const internationMobileNo = /^[0-9]{7,14}$/;
const emailRegex =
  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

export const stringRangeValidation = (
  key,
  value,
  required,
  min = 1,
  max = 200
) => {
  if (required) {
    if (!key || !value) {
      return `${capitalizeFirstLetter(key)} is required`;
    }
  }

  if (value.length < min || value.length > max) {
    return `${capitalizeFirstLetter(key)} must be${
      min < 2 ? "" : " between " + min + " and"
    } ${min < 2 ? "maximum " + max : max} characters long`;
  }

  return null;
};

export const isAlpha = (key, value, required, min = 1, max = 50) => {
  if (required) {
    if (!key || !value) {
      return `${capitalizeFirstLetter(key)} is required`;
    }
  }

  if (value) {
    if (!value.match(letters)) {
      return `${capitalizeFirstLetter(key)} must be letters only`;
    }
  }

  if (value.length < min || value.length > max) {
    return `${capitalizeFirstLetter(
      key
    )} must be between ${min} and ${max} characters long`;
  }

  return null;
};

export const isAlphanumeric = (key, value, required, min = 1, max = 50) => {
  if (required) {
    if (!key || !value) {
      return `${capitalizeFirstLetter(key)} is required`;
    }
  }

  if (value) {
    if (!value.match(alphaNumeric)) {
      return `${capitalizeFirstLetter(
        key
      )} must be alphanumeric and underscores only`;
    }
  }

  if (value.length < min || value.length > max) {
    return `${capitalizeFirstLetter(
      key
    )} must be between ${min} and ${max} characters long`;
  }

  return null;
};

export const isMobileNo = (key, value, required) => {
  if (required) {
    if (!key || !value) {
      return `${capitalizeFirstLetter(key)} no. is required`;
    }
  }

  if (value) {
    if (!value.match(internationMobileNo)) {
      return `${capitalizeFirstLetter(key)} no. must be valid`;
    }
  }

  return null;
};

export const isEmail = (key, value, required, min = 1, max = 50) => {
  if (required) {
    if (!key || !value) {
      return `${capitalizeFirstLetter(key)} is required`;
    }
  }

  if (!value.match(emailRegex)) {
    return `${capitalizeFirstLetter(key)} must be a valid Email`;
  }

  if (value.length < min || value.length > max) {
    return `${capitalizeFirstLetter(
      key
    )} must be between ${min} and ${max} characters long`;
  }

  return null;
};

const capitalizeFirstLetter = (string) => {
  let data = string.split("_");
  data[0] = data[0].charAt(0).toUpperCase() + data[0].substring(1);
  return data.join(" ");
};
