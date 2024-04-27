import React, { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/navbar'
import Image from 'next/image'

function Notices() {

    let [notices, setNotices] = useState([])



//     function createMarkup() {
//         return {
//             __html:
//                 `
//   <ul>
//     <li><span style="font-weight: bold;">Important:</span> <span style="font-style: italic;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</span></li>
//     <li><span style="font-style: italic;">Italic:</span> Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
//     <li><span style="font-weight: bold;">Bold and Italic:</span> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
//   </ul>
  
//   <table border="1">
//     <tr>
//       <th style="padding: 8px; border: 1px solid black;">Header 1</th>
//       <th style="padding: 8px; border: 1px solid black;">Header 2</th>
//       <th style="padding: 8px; border: 1px solid black;">Header 3</th>
//     </tr>
//     <tr>
//       <td style="padding: 8px; border: 1px solid black;">Data 1</td>
//       <td style="padding: 8px; border: 1px solid black;">Data 2</td>
//       <td style="padding: 8px; border: 1px solid black;">Data 3</td>
//     </tr>
//     <tr>
//       <td style="padding: 8px; border: 1px solid black;">Data 4</td>
//       <td style="padding: 8px; border: 1px solid black;">Data 5</td>
//       <td style="padding: 8px; border: 1px solid black;">Data 6</td>
//     </tr>
//   </table>
//             `
//         };
//     };



    return (
        <>
            <Navbar navFor="notices" />

            <h3 className="text-center mt-4 mb-3 fw-semibold text-decoration-underline">NOTICE &nbsp; BOARD</h3>
            <div className="container d-flex flex-column bg-light gap-3 border border-3 rounded-2 notices">

                <div className='notice border rounded-2 bg-white px-3 py-2'>
                    <div className='notice-header pt-2 pb-2 d-flex justify-content-start flex-row align-items-center gap-3'>
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

                    <div className='border'></div>

                    <div className='notice-body d-flex flex-column justify-content-start py-2 pb-3'>
                        <div className='notice-title'>
                            <h4 className='fw-semibold my-3'>Notice: {'New Rules & Regulations'}</h4>
                        </div>
                        <div className='notice-description' dangerouslySetInnerHTML={createMarkup()} />
                    </div>
                </div>

                <div className='notice border rounded-2 bg-white px-3 py-2'>
                    <div className='notice-header pt-2 pb-2 d-flex justify-content-start flex-row align-items-center gap-3'>
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

                    <div className='border'></div>

                    <div className='notice-body d-flex flex-column justify-content-start py-2 pb-3'>
                        <div className='notice-title'>
                            <h4 className='fw-semibold my-3'>Notice: {'New Rules & Regulations'}</h4>
                        </div>
                        <div className='notice-description' dangerouslySetInnerHTML={createMarkup()} />
                    </div>
                </div>

                <div className='notice border rounded-2 bg-white px-3 py-2'>
                    <div className='notice-header pt-2 pb-2 d-flex justify-content-start flex-row align-items-center gap-3'>
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

                    <div className='border'></div>

                    <div className='notice-body d-flex flex-column justify-content-start py-2 pb-3'>
                        <div className='notice-title'>
                            <h4 className='fw-semibold my-3'>Notice: {'New Rules & Regulations'}</h4>
                        </div>
                        <div className='notice-description' dangerouslySetInnerHTML={createMarkup()} />
                    </div>
                </div>

                <div className='notice border rounded-2 bg-white px-3 py-2'>
                    <div className='notice-header pt-2 pb-2 d-flex justify-content-start flex-row align-items-center gap-3'>
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

                    <div className='border'></div>

                    <div className='notice-body d-flex flex-column justify-content-start py-2 pb-3'>
                        <div className='notice-title'>
                            <h4 className='fw-semibold my-3'>Notice: {'New Rules & Regulations'}</h4>
                        </div>
                        <div className='notice-description' dangerouslySetInnerHTML={createMarkup()} />
                    </div>
                </div>



            </div>


            <style jsx>{`
        .notices {
          height: 70vh;
          padding: 30px;
          overflow-x: hidden;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          scroll-padding: 20px;
        }
        `}</style>
        </>
    )
}

export default Notices
