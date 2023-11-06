import React from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/navbar";

export default function MyStats() {
  const router = useRouter();
  const { name } = router.query;
  return (
    <>
      <Navbar navFor="crm" />
      <div className="containter text-center">
        <p className="my-3 fw-bold">
          Under construction! --{`>`} {name}
        </p>
      </div>
    </>
  );
}
