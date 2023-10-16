import React from "react";
import Navbar from "../../components/navbar";
import BarChart from "../../components/charts/Bar.chart"
import LineChart from "../../components/charts/Line.chart"
import { getSession, useSession } from "next-auth/react";
import { useState } from "react";

export default function Statistics() {
  const UserData = [
    {
      id: 1,
      year: 2016,
      userGain: 80000,
      userLost: 823,
    },
    {
      id: 2,
      year: 2017,
      userGain: 45677,
      userLost: 345,
    },
    {
      id: 3,
      year: 2018,
      userGain: 78888,
      userLost: 555,
    },
    {
      id: 4,
      year: 2019,
      userGain: 90000,
      userLost: 4555,
    },
    {
      id: 5,
      year: 2020,
      userGain: 4300,
      userLost: 234,
    },
  ];
  const [userData, setUserData] = useState({
    labels: UserData.map((data) => data.year),
    datasets: [
      {
        data: UserData.map((data) => data.userGain),
        backgroundColor: '#EEDC82',
        borderColor: "black",
      },
    ],
  });

  return (
    <>
      <Navbar navFor="admin" />
      <div className="container py-5">
        <BarChart  title="Number of Files: 1 Sept - 30 Sept" chartData={userData} />
      </div>
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
