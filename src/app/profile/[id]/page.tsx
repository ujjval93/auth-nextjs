export default async function UserProfile({params,}: {params: Promise<{ id: string }>;}) {
  const { id } = await params;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Profile</h1>
      <hr />
      <p>Profile page for user with ID: {id}</p>
    </div>
  );
}