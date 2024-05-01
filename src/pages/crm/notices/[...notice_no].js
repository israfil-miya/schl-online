import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import moment from "moment-timezone";

function Notice() {
  const router = useRouter();
  const { notice_no } = router.query;
  const [notice, setNotice] = useState({});

  async function fetchApi(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  }

  function isoDateToFormattedString(isoDate) {
    return moment(isoDate).tz("Asia/Dhaka").format("DD MMMM, YYYY");
  }

  const getNotice = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/notice`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          getnotice: true,
          notice_no,
        },
      };

      const notice_data = await fetchApi(url, options);

      if (!notice_data.error) {
        setNotice(notice_data);

        // redirect if not belongs to markters

        if (notice_data.channel != "marketers") {
          toast.error("The notice doesn't belong to this channel", {
            toastId: "error2",
          });
          router.push("/");
        }
      } else {
        toast.error(notice_data.message, { toastId: "error1" });
        router.push("/crm/notices/notice-board");
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      toast.error("Error retrieving notice", { toastId: "error3" });
      router.push("/crm/notices/notice-board");
    }
  };

  let constructFileName = (file_name, notice_no) => {
    let file_ext = file_name.split(".").pop();
    let file_name_without_ext = file_name.split(".").slice(0, -1).join(".");
    let new_file_name = `${file_name_without_ext}_${notice_no}.${file_ext}`;
    return new_file_name;
  };

  const handleFileDownload = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
      const options = {
        method: "GET",
        headers: {
          downloadfile: true,
          filename: constructFileName(notice.file_name, notice_no),
          folder_name: "notice",
        },
      };

      const response = await fetch(url, options);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = notice.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Error downloading the file.");
        toast.error("Error downloading the file.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    getNotice();
  }, [notice_no]);

  return (
    <>
      <Navbar navFor={"crm"} />

      <div className="notice container mt-5 mb-3">
        <div className="notice-header">
          <h2 className="mb-0 fw-semibold">{notice.title}</h2>
          <p className="fs-6 fw-medium text-body-secondary">
            {isoDateToFormattedString(notice.updatedAt)}
          </p>
        </div>
        <div
          className="notice-body mt-2 mb-3"
          dangerouslySetInnerHTML={{ __html: notice.description }}
        />

        {notice.file_name ? (
          <div className="file-download">
            <span className="fw-semibold">Downloads: </span>{" "}
            <span
              onClick={handleFileDownload}
              className="text-decoration-underline font-monospace downloadable-file"
            >
              {notice.file_name}
            </span>
          </div>
        ) : null}
      </div>
      <style jsx>{`
.downloadable-file {
    cursor: pointer;
}
}
`}</style>
    </>
  );
}

export default Notice;
