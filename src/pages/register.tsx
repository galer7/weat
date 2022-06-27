import { NextPage } from "next";
import React from "react";
import { trpc } from "../utils/trpc";

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface YourFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const Register: NextPage = () => {
  const handleSubmit = async (event: React.FormEvent<YourFormElement>) => {
    event.preventDefault();

    const {
      email: { value: email },
      password: { value: password },
    } = event.currentTarget.elements;

    await trpc.useMutation("register", { email, password_hash });
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
