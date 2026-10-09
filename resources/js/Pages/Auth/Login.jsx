import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        post(route('login'));
    }

    return (
        <>
            <Head title="IKLI — Login" />

            <div className="h-screen flex flex-col bg-[#f2f2f2] overflow-hidden">

                {/* Header Logos */}
                <header className="py-3 shrink-0">
                    <div className="flex flex-wrap justify-center items-center gap-6">
                        <img
                            src="/images/up_logo.webp"
                            alt="UP Logo"
                            className="w-auto h-auto max-w-[100px] max-h-[100px] object-contain"
                        />
                        <img
                            src="/images/upm_white-transparent.png"
                            alt="UP Manila Logo"
                            className="w-auto h-auto max-w-[100px] max-h-[100px] object-contain"
                        />
                        <img
                            src="/images/logo (1).webp"
                            alt="IKLI Logo"
                            className="w-auto h-auto max-w-[100px] max-h-[100px] object-contain"
                        />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-grow flex justify-center items-center px-4 overflow-hidden">
                    <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-5xl">

                        {/* Left Panel */}
                        <div className="bg-[#7B1113] w-full md:w-2/5 flex flex-col justify-center items-center text-white py-8 px-6">
                            <div className="text-center w-full">

                                {/* UP Badge */}
                                <div className="mx-auto w-16 h-16 rounded-full bg-[#FFD100]/20 border-2 border-[#FFD100]/40 flex items-center justify-center mb-3 shadow-lg">
                                    <span className="text-[#FFD100] text-xl font-black">UP</span>
                                </div>

                                <h1 className="text-4xl font-black text-[#FFD100] tracking-widest mb-1">
                                    IKLI
                                </h1>
                                <p className="text-xs font-semibold px-4 leading-snug text-white/80">
                                    Instant Key Link Integration
                                </p>

                                <div className="h-px w-16 bg-[#FFD100]/40 mx-auto rounded-full my-3" />

                                <p className="text-xs text-white/50">
                                    University of the Philippines Manila
                                </p>

                                {/* Decorative circles */}
                                <div className="mt-6 flex justify-center gap-3 opacity-20">
                                    <div className="w-2 h-2 rounded-full bg-[#FFD100]" />
                                    <div className="w-2 h-2 rounded-full bg-[#FFD100]" />
                                    <div className="w-2 h-2 rounded-full bg-[#FFD100]" />
                                </div>
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="w-full md:w-3/5 py-6 px-10 flex flex-col justify-center">

                            <div className="text-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
                                <p className="text-sm text-gray-500 mt-1">Sign in to continue to IKLI</p>
                            </div>

                            {/* Status Message */}
                            {status && (
                                <div className="mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-3">

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        UP Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                        autoFocus
                                        placeholder="juan@up.edu.ph"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] ${
                                            errors.email
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-300 bg-white'
                                        }`}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-600">⚠ {errors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-bold text-gray-700">
                                            Password
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs text-[#7B1113] hover:underline font-medium"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-[#7B1113]/20 focus:border-[#7B1113] ${
                                            errors.password
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-300 bg-white'
                                        }`}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-xs text-red-600">⚠ {errors.password}</p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                        className="accent-[#7B1113] w-4 h-4"
                                    />
                                    <label htmlFor="remember" className="text-sm text-gray-600">
                                        Remember me
                                    </label>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#7B1113] hover:bg-[#5A0D0F] text-[#FFD100] font-bold py-2.5 rounded-lg transition disabled:opacity-60 text-sm"
                                >
                                    {processing ? 'Signing in...' : 'Sign In'}
                                </button>

                            </form>

                            {/* Register Link */}
                            <div className="text-center mt-4">
                                <p className="text-xs text-gray-500">
                                    Don't have an account?{' '}
                                    <Link
                                        href={route('register')}
                                        className="text-[#7B1113] font-bold hover:underline"
                                    >
                                        Register here
                                    </Link>
                                </p>
                            </div>

                            <div className="text-center mt-2 text-xs text-gray-400">
                                © {new Date().getFullYear()} University of the Philippines Manila
                            </div>

                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer
                    className="relative bg-[#820f0f] shrink-0 overflow-hidden"
                    style={{ minHeight: '130px' }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: "url('/images/simplified_facade.webp')",
                            backgroundSize: '100%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center bottom',
                            opacity: 0.4,
                        }}
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-5">
                        <p className="text-white font-medium text-sm">
                            IKLI — Instant Key Link Integration
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                            © {new Date().getFullYear()} University of the Philippines Manila
                        </p>
                    </div>
                </footer>

            </div>
        </>
    );
}