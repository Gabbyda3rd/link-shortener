<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Url Shortener</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        upmaroon: '#7B1113',
                        upgold: '#FFCC00',
                        lightgray: '#F8F8F8'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-lightgray py-10 min-h-screen">

    <div class="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-8 border-2 border-upmaroon">
        <h1 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-red md:text-5xl lg:text-6xl"><span class="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-red-600">URL Shortener</span></h1>

        <form action="{{ route('shorten') }}" method="POST" class="space-y-4">
            @csrf
            <input type="text" name="url" placeholder="Paste your Url Here" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-non focus:ring-2 focus:ring-upmaroon required">
            <button type="submit" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Shorten Url</button>

        </form>
        
        @if(isset($shortUrl))
            <div class="mt-8 text-center">
                <p class="text-gray-800">Your Shortened URL:</p>
                <a href="{{ $shortUrl }}" class="text-upmaroon underline text-lg hover:text-upgold">{{$shortUrl}}</a>
            </div>
        @endif

        @if(isset($qrCodePath))
            <div class="mt-6 text-center">
                <p class="text-gray-700 mb-2">Scan QR Code:</p>
                <img src="{{ asset('storage/'.$qrCodePath) }}" alt="QR Code" class="mx-auto h-40 w-40 border border-upmaroon p-1 bg-white">
            </div>
        @endif

        @if ($errors->any())
            <div class="mt-4 text-red-600 text-sm">
                <ul>
                    @foreach ($errors->all() as $error )
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
            
        @endif

    </div>
    
</body>
</html>