export default function Crm() {
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
