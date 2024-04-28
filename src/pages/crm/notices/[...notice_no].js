import React from 'react'
import { useRouter } from 'next/router'

function Notice() {
    const router = useRouter()
    const { noticeId } = router.query
    return (
        <>

            <p>{noticeId}</p>

        </>
    )
}

export default Notice
