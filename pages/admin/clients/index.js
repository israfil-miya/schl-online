export default function Clients() {
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
