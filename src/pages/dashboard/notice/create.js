import React, { useState } from 'react'
import Navbar from '@/components/navbar'
import { toast } from 'sonner'



function CreateNotice() {


    async function fetchApi(url, options) {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    }


    let [noticeData, setNoticeData] = useState({notice_no: "", title: "", description: "", file_name: "", channel: "marketers" })
    let [file, setFile] = useState(null)


    let handleOnChange = (e => {
        setNoticeData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value
        }))
    })

    let handleFileInput = (e) => {
        let file = e.target.files[0]
        setNoticeData((prevData) => ({
            ...prevData,
            file_name: file.name
        }))
        setFile(file)
    }


    let constructFileName = (file, notice_no) => {
        let file_name = file.name
        let file_ext = file_name.split('.').pop()
        let file_name_without_ext = file_name.split('.').slice(0, -1).join('.')
        let new_file_name = `${file_name_without_ext}_${notice_no}.${file_ext}`
        return new_file_name
    }

    let handleNoticeFormSubmit = async (e) => {
        e.preventDefault()
        console.log(noticeData, file)

        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/notice`;
        const options = {
            method: "POST",
            body: JSON.stringify({
                channel: noticeData.channel,
                notice_no: noticeData.notice_no,
                title: noticeData.title,
                description: noticeData.description,
                file_name: noticeData.file_name || undefined
            }),
            headers: {
                "Content-Type": "application/json",
                storenotice: true,
            },
        };

        try {
            const result = await fetchApi(url, options);

            if (!result.error) {
                if (file) {

                    let formData = new FormData()
                    formData.append("file", file, constructFileName(file, result.notice_no))

                    let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ftp`;
                    let options = {
                        method: "POST",
                        body: formData,
                        headers: {
                            folder_name: "notice",
                            insertfile: true,
                        },
                    };

                    let ftp_res = await fetchApi(url, options)


                    if(ftp_res.error) {
                        toast.error("Unable to send the notice")
                    } else {
                        toast.success("Successfully sent the notice")
                    }
                } else {
                    toast.success("Successfully sent the notice");
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error adding new client:", error);
            toast.error("Error adding new client");
        } finally {
            e.target.reset()
            setNoticeData({ title: "", description: "", file_name: "", channel: "marketers" })
            setFile(null)
        }
    }

    return (
        <>
            <Navbar navFor="dashboard" />
            <div className="container create-notice my-5">
                <h5 className="py-3">Create Notice</h5>
                <form onSubmit={handleNoticeFormSubmit} id="inputForm">

                    <div className="mb-3">
                        <label className="form-label">
                            Channel
                        </label>
                        <select
                            required
                            value={noticeData.channel}
                            onChange={handleOnChange}
                            name="channel"
                            className="form-select"
                        >
                            <option value="marketers">Marketers</option>
                            <option value="production">Production</option>
                        </select>
                    </div>


                    
                    <div className="mb-3">
                        <label className="form-label">
                            Notice No.
                        </label>
                        <input
                            type="text"
                            value={noticeData.notice_no}
                            onChange={handleOnChange}
                            name="notice_no"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Title
                        </label>
                        <input
                            type="text"
                            value={noticeData.title}
                            onChange={handleOnChange}
                            name="title"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Description
                        </label>
                        <textarea
                            value={noticeData.description}
                            onChange={handleOnChange}
                            rows={15}
                            name="description"
                            className="form-control w-100"
                            required
                        ></textarea>
                    </div>

                    <div className="mb-3 d-flex flex-column">
                        <label className="form-label">
                            Notice File
                        </label>
                        <input onChange={handleFileInput} type="file" className="form-control" id="customFile" accept=".xls, .xlsx, .doc, .docx, .ppt, .pptx, .txt, .pdf" />
                    </div>


                    <button type="submit" className="btn btn-sm btn-outline-primary">
                        Send Notice
                    </button>
                </form>
            </div>
        </>
    )
}

export default CreateNotice
