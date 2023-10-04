export default function Dashboard() {
    return
}
export async function getServerSideProps() {
    return {
        redirect: {
            destination: "/",
            permanent: true,
        },
    };
}
