import React from 'react'
import Navbar from '@/components/navbar'
import Image from 'next/image'

function Notices() {
    return (
        <>
            <Navbar navFor="crm" />
            <div className="container my-5 border rounded-3 notices">


                <div className='notice border rounded-3 bg-white px-3 py-1'>
                    <div className='d-flex justify-content-start align-items-center gap-3'>
                        <Image
                            priority
                            src="/images/NEW-SCH-logo-text-grey.png"
                            alt="Logo"
                            width={60}
                            height={60}
                            className="me-2 rounded-circle"
                        />
                        <div className='d-flex flex-column'>
                            <h5 className='fw-semibold mb-0'>Studio Click House LTD.</h5>
                            <smal className="text-body-secondary"><b>28 April, 2024</b></smal>
                        </div>
                    </div>
                </div>



            </div>


            <style jsx>{`
        .notices {
          min-height: 70vh;
          padding: 30px;
          box-shadow: inset 0 0 15px 3px rgba(0, 0, 0, 0.1);
          overflow-y: scroll;
        }
        `}</style>
        </>
    )
}

export default Notices
