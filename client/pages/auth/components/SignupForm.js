import InputBox from './../../../src/components/Form/Input'
import Button from './../../../src/components/Form/Button'
import { useState } from 'react';
import {isAlpha, isAlphanumeric, isEmail, isMobileNo, stringRangeValidation} from './../../../src/utils/validations'
import {authService} from './../../../src/services'
import { setCookie } from 'nookies'
import { useDispatch } from 'react-redux'
import {authActionTypes} from './../../../src/store/auth/auth.actiontype'
import Router from "next/router";

const SignupForm = () => {

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "waqaar",
    last_name: "aslam",
    username: "w112",
    email: "w@gmail.com",
    mobile: "8989898989",
    password: "qwerty",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (data) => {
    const { name, value } = data; 
    setFormData({...formData, [name]: value});
    handleError(data)
  }

  const fieldValidation = (name, value) => {
    let error;
    if (name === 'first_name' || name === 'last_name') {
      error = isAlpha(name, value, true, 1, 50);
    } else if (name === 'username') {
      error = isAlphanumeric(name, value, true, 1, 50);
    } else if (name === 'email') {
      error = isEmail(name, value, true, 1, 50);
    } else if (name === 'mobile') {
      error = isMobileNo(name, value, true);
    } else if (name === 'password') {
      error = stringRangeValidation(name, value, true, 6, 20);
    }
    return error;
  }

  const handleError = ({name, value}) => {
    let error = fieldValidation(name, value)
    if (error !== true) {
      setErrors({...errors, [name]: error})
    } else {
      delete errors[name]
      setErrors(errors)
    }
  }

  const submitValidation = (data) => {
    let errorObj = {};
    for (const [name, value] of Object.entries(data)) {
      let error = fieldValidation(name, value)
      if (error !== null) {
        errorObj[name] = error;
      } else {
        delete errorObj[name]
      }
    }
    setErrors({...errors, ...errorObj})
    return Object.keys(errorObj).length !== 0
  }

  const handleSubmit = async (e) => {
    const error = submitValidation(formData)
    if (!error) {
      try {
        setLoading(true)
        const {data: {data: {user, token}}} = await authService.Signup(formData)
        dispatch({type: authActionTypes.WATCH_LOGIN_SUCCESS, payload: {data: user}})
        setCookie(null, "engToken", token);
        setLoading(false)
        Router.push("/", '/index');
      } catch (error) {
        setLoading(false)
        const {data: {data: {data}}} = error
        setErrors({...errors, ...data})
      }
    }
  }

  return (
    <>
      <div className="col-6">
        <InputBox
          type="text"
          name="first_name"
          label="First Name"
          placeholder="Enter your first name"
          handleChange={handleChange}
          value={formData.first_name}
          error={errors.first_name}
        />
      </div>
      <div className="col-6">
        <InputBox
          type="text"
          name="last_name"
          label="Last Name"
          placeholder="Enter your last name"
          handleChange={handleChange}
          value={formData.last_name}
          error={errors.last_name}
        />
      </div>
      <div className="col-6">
        <InputBox
          type="text"
          name="username"
          label="Username"
          placeholder="example123"
          handleChange={handleChange}
          value={formData.username}
          error={errors.username}
        />
      </div>
      <div className="col-6">
        <InputBox
          type="text"
          name="email"
          label="Email"
          placeholder="example@mail.com"
          handleChange={handleChange}
          value={formData.email}
          error={errors.email}
        />
      </div>
      <div className="col-12">
        <InputBox
          type="text"
          name="mobile"
          label="Mobile No."
          placeholder="987050****"
          handleChange={handleChange}
          value={formData.mobile}
          error={errors.mobile}
        />
      </div>
      <div className="col-12">
        <InputBox
          type="password"
          name="password"
          label="Password"
          placeholder="6+ Strong Characters"
          handleChange={handleChange}
          value={formData.password}
          error={errors.password}
        />
      </div>
      <div className="col-12">
        <Button 
          text="Create an account"
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
          buttonStyle="primeButton"
          />
      </div>
    </>
  );
};

export default SignupForm;
