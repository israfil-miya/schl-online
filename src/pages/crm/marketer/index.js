export default function Marketer() {
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
