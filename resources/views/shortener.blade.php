<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IKLI – Instant Key Link Integration</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="min-h-screen bg-gradient-to-br from-[#faf7f5] to-[#fdfdfd] flex items-center justify-center p-6">

    <div class="w-full max-w-xl bg-white shadow-xl rounded-xl border border-gray-200 p-8 relative overflow-hidden">

        {{-- Header --}}
        <div class="text-center mb-8">
            <div class="mx-auto w-16 h-16 flex items-center justify-center bg-[#FFD100]/20 text-[#7B1113] rounded-full shadow-sm mb-4">
                <i class="fas fa-university text-2xl"></i>
            </div>
            <h1 class="text-3xl font-extrabold text-[#7B1113] tracking-tight">IKLI</h1>
            <p class="text-gray-600 text-sm mt-2">Instant Key Link Integration.</p>
        </div>

        {{-- Validation Errors --}}
        @if ($errors->any())
            <div class="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm space-y-1">
                @foreach ($errors->all() as $error)
                    <p><i class="fas fa-exclamation-circle mr-1"></i>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        @if (session('success'))
            <div class="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                <i class="fas fa-check-circle mr-1"></i>{{ session('success') }}
            </div>
        @endif

        {{-- Form --}}
        <form action="{{ route('shorten.store') }}" method="POST" class="space-y-6">
            @csrf

            {{-- URL Input --}}
            <div>
                <label for="url" class="block text-sm font-semibold text-[#7B1113] mb-1">Enter URL</label>
                <input
                    type="url"
                    id="url"
                    name="url"
                    value="{{ old('url') }}"
                    required
                    placeholder="https://example.com/long-link"
                    class="w-full px-4 py-3 border rounded-lg bg-gray-50 outline-none transition shadow-sm
                           {{ $errors->has('url') ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-gray-300 focus:ring-2 focus:ring-[#FFD100] focus:border-[#7B1113]' }}"
                >
                @error('url')
                    <p class="text-sm text-red-600 mt-1"><i class="fas fa-exclamation-circle mr-1"></i>{{ $message }}</p>
                @enderror
            </div>

            {{-- Link Type --}}
            <div>
                <label class="block text-sm font-semibold text-[#7B1113] mb-2">Choose link type</label>
                <div class="flex space-x-6">
                    <label class="flex items-center space-x-2 cursor-pointer hover:text-[#7B1113] transition">
                        <input type="radio" name="link_type" value="auto"
                            class="text-[#7B1113] focus:ring-[#FFD100]"
                            {{ old('link_type', 'auto') === 'auto' ? 'checked' : '' }}>
                        <span class="text-sm text-gray-700">Auto</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer hover:text-[#7B1113] transition">
                        <input type="radio" name="link_type" value="custom"
                            class="text-[#7B1113] focus:ring-[#FFD100]"
                            {{ old('link_type') === 'custom' ? 'checked' : '' }}>
                        <span class="text-sm text-gray-700">Custom</span>
                    </label>
                </div>
            </div>

            {{-- Custom Code --}}
            <div id="custom-code-field" class="{{ old('link_type') === 'custom' ? '' : 'hidden' }}">
                <label for="custom_code" class="block text-sm font-semibold text-[#7B1113] mb-1">Custom Code</label>
                <input
                    type="text"
                    id="custom_code"
                    name="custom_code"
                    value="{{ old('custom_code') }}"
                    maxlength="20"
                    placeholder="Enter Custom Code"
                    class="w-full px-4 py-3 border rounded-lg bg-gray-50 outline-none transition shadow-sm
                           {{ $errors->has('custom_code') ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-gray-300 focus:ring-2 focus:ring-[#FFD100] focus:border-[#7B1113]' }}"
                >
                @error('custom_code')
                    <p class="text-sm text-red-600 mt-1"><i class="fas fa-exclamation-circle mr-1"></i>{{ $message }}</p>
                @enderror
                <p class="text-xs text-gray-500 mt-1">3–20 characters, letters &amp; numbers only</p>
            </div>

            {{-- Submit --}}
            <button type="submit"
                class="w-full bg-gradient-to-r from-[#7B1113] to-[#5A0D0F] hover:from-[#5A0D0F] hover:to-[#4A0A0C]
                       text-[#FFD100] font-semibold py-3 rounded-lg shadow-md transition transform
                       hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2">
                <i class="fas fa-compress-alt"></i>
                <span>Shorten URL</span>
            </button>
        </form>

        {{-- Result --}}
        @isset($shortUrl)
            <div class="mt-10 border-t border-gray-200 pt-6">
                <p class="text-sm font-semibold text-[#7B1113] mb-2">Your Shortened URL:</p>
                <div class="flex items-center space-x-2">
                    <input type="text" value="{{ $shortUrl }}" readonly id="shortUrlResult"
                        class="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm focus:outline-none shadow-sm">
                    <button onclick="copyToClipboard('{{ $shortUrl }}')"
                        class="px-3 py-2 bg-[#7B1113] text-[#FFD100] rounded-lg text-sm hover:bg-[#5A0D0F] transition flex items-center space-x-1">
                        <i class="fas fa-copy"></i>
                        <span>Copy</span>
                    </button>
                </div>

                @isset($qrCodePath)
                    <div class="mt-6 text-center">
                        <p class="text-sm font-semibold text-[#7B1113] mb-2">QR Code:</p>
                        <img src="{{ asset('storage/' . $qrCodePath) }}" alt="QR Code for {{ $shortUrl }}"
                            class="w-32 h-32 mx-auto shadow-lg rounded-lg border p-2 bg-white">
                        <a href="{{ asset('storage/' . $qrCodePath) }}" download
                            class="inline-block mt-3 text-xs text-[#7B1113] hover:underline">
                            <i class="fas fa-download mr-1"></i>Download QR Code
                        </a>
                    </div>
                @endisset
            </div>
        @endisset

        {{-- Footer --}}
        <div class="text-center mt-8">
            <p class="text-xs text-gray-500">&copy; {{ date('Y') }} University of the Philippines Manila. All rights reserved.</p>
        </div>

    </div>

    <script>
        document.querySelectorAll('input[name="link_type"]').forEach(radio => {
            radio.addEventListener('change', function () {
                document.getElementById('custom-code-field').classList.toggle('hidden', this.value !== 'custom');
            });
        });

        async function copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);

                const btn = document.querySelector('[onclick^="copyToClipboard"]');
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
                btn.classList.add('bg-green-700');
                btn.classList.remove('bg-[#7B1113]', 'hover:bg-[#5A0D0F]');

                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.classList.remove('bg-green-700');
                    btn.classList.add('bg-[#7B1113]', 'hover:bg-[#5A0D0F]');
                }, 2000);
            } catch {
                alert('Failed to copy. Please copy manually: ' + text);
            }
        }
    </script>
</body>
</html>