import React, { Fragment, useState } from "react";
import {Link} from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const submitHandler = (e) => {
      e.preventDefault();
      console.log("Success")
  };
  const { email, password } = formData;
  return (
    <Fragment>
      <section className="container">
        <h1 className="large text-primary">Sign In</h1>
        <p className="lead">
          <i className="fas fa-user"></i> Log in to your account
        </p>
        <form className="form" action="create-profile.html">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              onChange={handleChange}
              required
              value={email}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              minLength="6"
              value={password}
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="submit"
            className="btn btn-primary"
            value="Register"
            onClick={submitHandler}
          />
        </form>
        <p className="my-1">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </section>
    </Fragment>
  );
};

export default Login;