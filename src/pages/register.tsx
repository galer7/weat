import { NextPage } from "next";
import React from "react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface YourFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const Register: NextPage = () => {
  const router = useRouter();

  const registerMutation = trpc.useMutation("auth.register", {
    onSuccess: () => router.push("/food"),
  });
  const handleSubmit = async (event: React.FormEvent<YourFormElement>) => {
    event.preventDefault();

    const {
      email: { value: email },
      password: { value: password },
    } = event.currentTarget.elements;

    console.log("captured inputs from form:", { email, password });
    registerMutation.mutate({ email, password });
  };

  return (
    <div>
      <div>Join the party!</div>
      <form action="" className="w-1/2" onSubmit={handleSubmit}>
        <fieldset disabled={registerMutation.isLoading}>
          <label className="flex gap-2 justify-around">
            Email
            <input type="text" id="email" className="border-black border-2" />
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
        </fieldset>
      </form>
      {registerMutation.error && (
        <p>Something went wrong! {JSON.stringify(registerMutation.error)}</p>
      )}
    </div>
  );
};

export default Register;
