import React from "react";
import Navbar from "../../components/navbar";
import { getSession, useSession } from "next-auth/react";

export default function Statistics() {
  return (
    <>
      <Navbar navFor="admin" />
      <div className="text-center my-5 fw-bold">Under development</div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  // code for redirect if not logged in
  if (
    !session ||
    session.user.role == "user" ||
    session.user.role == "manager"
  ) {
    return {
      redirect: {
        destination: "/?error=You need Admin/Super role to access the page",
        permanent: true,
      },
    };
  } else
    return {
      props: {},
    };
}
