import React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
export default function Database() {
  const router = useRouter();
  const [list, setList] = useState([]);


  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  async function getFiles() {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getfiles: true,
        },
      };

      const List = await fetchApi(url, options);

      if (!List.error) {
        setList(List);
      } else {
        toast.error("Unable to retrieve file list", {toastId: "error1"});
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving file list", {toastId: "error2"});
    }
  }



  useEffect(() => {
    getFiles()
  }, []);


  return (
    <div>
      <h2>FTP Directory List</h2>
      <ul>
        {list.map((item) => (
          <li key={item.name}>{item.name}</li>
        ))}
      </ul>
    </div>
  );

}
