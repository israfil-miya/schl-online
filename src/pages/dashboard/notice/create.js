import React, { useState } from 'react'
import Navbar from '@/components/navbar'


function CreateNotice() {

    let [noticeData, setNoticeData] = useState({ title: "", description: "", channel: "marketers" })



    let handleOnChange = (e => {
        setNoticeData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value
        }))
    })


    let handleNoticeFormSubmit = (e) => {
        e.preventDefault()
        console.log(noticeData)
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

                    <button type="submit" className="btn btn-sm btn-outline-primary">
                        Send Notice
                    </button>
                </form>
            </div>
        </>
    )
}

export default CreateNotice
