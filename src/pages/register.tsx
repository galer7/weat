import { NextPage } from "next";
import React from "react";

interface FormElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

interface YourFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const Register: NextPage = () => {
  const handleSubmit = (event: React.FormEvent<YourFormElement>) => {
    event.preventDefault();

    // TODO: Post request
    console.log(event.currentTarget.elements.username.value);
  };

  return (
    <div>
      <div>Join the party!</div>
      <form action="" className="w-1/2" onSubmit={handleSubmit}>
        <label className="flex gap-2 justify-around">
          Username
          <input type="text" id="username" className="border-black border-2" />
        </label>
        <label className="flex gap-2 justify-around">
          Password
          <input
            type="password"
            id="password"
            className="border-black border-2"
          />
        </label>
        <input type="submit" value="submit" />
      </form>
    </div>
  );
};

export default Register;
