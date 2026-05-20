localStorage.setItem("user_name", response.data.name);  // if your API returns name
localStorage.setItem("user_email", response.data.email);
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Login Page</h1>
    </div>
  );
}