export default function Invoice() {
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
