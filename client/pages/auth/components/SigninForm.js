import InputBox from './../../../src/components/Form/Input'
import Button from './../../../src/components/Form/Button'
import { useState } from 'react';
import { isEmail, stringRangeValidation} from './../../../src/utils/validations'
import {authService} from './../../../src/services'
import { setCookie } from 'nookies'
import { useDispatch } from 'react-redux'
import {authActionTypes} from './../../../src/store/auth/auth.actiontype'
import Router from "next/router";
import { HTTPClient } from './../../../src/services';

const SigninForm = () => {

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "waqaar145@gmail.com",
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
    if (name === 'email') {
      error = isEmail(name, value, true, 1, 50);
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
        const {data: {data: {user, token}}} = await authService.Signin(formData)
        dispatch({type: authActionTypes.WATCH_LOGIN_SUCCESS, payload: {data: user}})
        HTTPClient.saveHeader({key: 'Authorization', value: `Bearer ${token}`})
        setCookie(null, "engToken", token);
        setLoading(false)
        Router.push("/chat/chat", '/chat');
      } catch (error) {
        setLoading(false)
        const {data: {data: {data}}} = error
        setErrors({...errors, ...data})
      }
    }
  }

  return (
    <>
      <div className="col-12">
        <InputBox
          type="text"
          name="email"
          label="Email / Mobile No"
          placeholder="example@mail.com or 9870******"
          handleChange={handleChange}
          value={formData.email}
          error={errors.email}
          autoFocus
        />
      </div>
      <div className="col-12">
        <InputBox
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          handleChange={handleChange}
          value={formData.password}
          error={errors.password}
        />
      </div>
      <div className="col-12">
        <Button 
          text="Sign in"
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
          buttonStyle="primeButton"
        />
      </div>
    </>
  );
};

export default SigninForm;