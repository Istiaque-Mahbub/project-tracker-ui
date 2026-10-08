import Link from "next/link";
import RegisterForm from "@/components/auth/form/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex">
      {/* Left Panel - Image & Brand Section */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950 px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create an Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Registration Form */}
          <RegisterForm />
        </div>
      </div>

      {/* Right Panel - Form Section */}


      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop"
            alt="Developer Project Tracker"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        </div>

        {/* Overlay Branding Content */}
        <div className="relative z-10 mt-auto p-12 text-white max-w-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-xl mb-6 shadow-lg shadow-blue-500/30">
            D
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
            Developer Project Tracker
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Join your team, manage sprints, and accelerate your development
            workflow all in one unified workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
