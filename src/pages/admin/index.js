export default function Admin() {
  return;
}
export async function getServerSideProps() {
  return {
    redirect: {
      destination: "/",
      permanent: true,
    },
  };
}
