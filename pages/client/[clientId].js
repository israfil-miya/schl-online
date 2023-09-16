import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Navbar from "../../components/navbar";

export default function ClientDetails() {

    const router = useRouter();
    const { data: session } = useSession();
    const [client, setClient] = useState({});
    const clientId = router.query.clientId

    async function fetchClientData(url, options) {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    }


    async function getClientDetails() {
        try {
            const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/client`;
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    getclientsbyid: true,
                    id: clientId
                },
            };

            const clientData = await fetchClientData(url, options);

            if (!clientData.error) {
                setClient(clientData);
            } else {
                toast.error("Unable to retrieve client");
            }
        } catch (error) {
            console.error("Error fetching client:", error);
            toast.error("Error retrieving client");
        }
    }


    useEffect(() => {
        getClientDetails();
    }, []);

    return (
        <div>
            <Navbar navFor="admin" />

            <div className="container rounded border shadow-sm my-5">
                <div className="row align-items-start">
                    <div className="col rounded-0 card">
                        <div className="card-body">
                            <h5 className="card-title">Client Details</h5>
                            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card content.</p>
                            <a href="#" className="btn btn-primary">Go somewhere</a>
                        </div>
                    </div>
                    <div className="col rounded-0 card">
                        <div className="card-body">
                            <h5 className="card-title">Create Invoice</h5>
                            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card content.</p>
                            <a href="#" className="btn btn-primary">Go somewhere</a>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}
