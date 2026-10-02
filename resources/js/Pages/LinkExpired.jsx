export default function LinkExpired() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#7B1113] to-[#2D0506] flex items-center justify-center p-6">
            <div className="text-center text-white space-y-4">
                <div className="text-6xl">⏰</div>
                <h1 className="text-3xl font-black text-[#FFD100]">Link Expired</h1>
                <p className="text-white/70">This link has expired and is no longer available.</p>
                <a  href="/"
                    className="inline-block mt-4 px-6 py-3 bg-[#FFD100] text-[#7B1113] font-bold rounded-lg hover:bg-yellow-400 transition">
                    Go to IKLI
                </a>
            </div>
        </div>
    );
}