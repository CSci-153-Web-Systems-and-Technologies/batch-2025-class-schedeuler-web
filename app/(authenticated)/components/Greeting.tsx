import React from "react";

interface GreetingProps {
  userName: string;
}

const Greeting = ({ userName }: GreetingProps) => {
  return <h1 className="text-3xl font-bold"
  style={{ color: 'var(--color-text-primary)' }}
  >Hello, {userName}!</h1>;
};

export default Greeting;
