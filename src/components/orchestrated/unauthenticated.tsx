import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { PageHeader } from "./page-header";

export const Unauthenticated = () => {
  return (
    <main className="flex flex-col justify-center">
      <PageHeader
        title="Please Login First"
        description="You must be logged in to make picks"
      >
        <Button onClick={() => void signIn()}>Sign in</Button>
      </PageHeader>
    </main>
  );
};
