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
        <h1 class="mb-4 text-3xl font-extrabold text-gray-900 dark:text-red md:text-5xl lg:text-6xl"><span class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-400">Link Shortener</span></h1>

        {{-- <form action="{{ route('shorten') }}" method="POST" class="space-y-4">
            @csrf
            <input type="text" name="url" placeholder="Paste your Url Here" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-non focus:ring-2 focus:ring-upmaroon required">
            
            @error('url')
                <div>
                    {{ $message }}
                </div>
            @enderror

            <button type="submit" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Shorten Url</button>
        </form> --}}

        {{-- @if ($errors->any())
            <div class="mt-4 text-red-600 text-sm">
                <ul>
                    @foreach ($errors->all() as $error )
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif --}}


        {{-- # Form to shorten URL --}}
         <form action="{{ route('shorten.store') }}" method="POST" class="space-y-4">
            @csrf

            <input type="text" name="url" placeholder="example.com" value="{{ old('url') }}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-upmaroon">
            @error('url')
                <div class="text-red-600 text-sm">
                    {{ $message }}
                </div>
            @enderror
            <br><br>
            
            <label>
                <input type="radio" name="link_type" value="auto" {{ old('link_type','auto') == 'auto' ? 'checked': '' }}>
                Auto generate short link
            </label>

            <label>
                <input type="radio" name="link_type" value="custom" {{ old('link_type') == 'custom' ? 'checked': '' }}>
                Custom short link
            </label>
            <br><br>

            <div id="custom-code-field" style="display: {{ old('link_type') == 'custom' ? 'block' : 'none' }};">
                <label for="custom_mode">
                    Custom Code:
                </label>
                <input type="text" name="custom_code" placeholder="e.g. customlink123" value="{{ old('custom_code') }}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-upmaroon" >
                @error('custom_code')
                    <div class="text-red-600 text-sm">
                        {{ $message }}
                    </div>
                @enderror
            </div>
            <br>

            <button type="submit" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Shorten Url</button>
            
        </form> 



        {{-- #2nd form with ajax --}}
         {{-- <form id="shortenForm">
            @csrf
            <input type="text" name="url" placeholder="Enter URL" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-upmaroon">
            <select name="link_type" id="linkType" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-upmaroon mt-4">
                <option value="auto">Auto Generate</option>
                <option value="custom">Custom</option>
            </select>

            <input type="text" name="custom_code" id="customCode" placeholder="Custom Code" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-upmaroon mt-4" style="display: none;">

            <button type="submit" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Shorten</button>

        </form> --}}

        
        {{-- <div id="errors" style="color:red;"></div>

        <div id="result" style="margin-top:20px;"></div>

         #script ajax

        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
           $('#linkType').on('change', function() {
        if ($(this).val() === 'custom') {
            $('#customCode').show();
        } else {
            $('#customCode').hide();
        }
    });

    // Event handler for when the form with the ID 'shortenForm' is submitted
    $('#shortenForm').on('submit', function(e) {
        // Prevent the default form submission behavior
        e.preventDefault();

        // Clear previous errors and results
        $('#errors').html('');
        $('#result').html('');

        // AJAX request to submit the form data
        $.ajax({
            url: "{{ route('shorten.store') }}",
            method: "POST",
            data: $(this).serialize(), // Serialize the form data
            success: function(response) {
                if (response.success) {
                    $('#result').html(`
                        <p>Short URL: <a href="${response.short_url}" target="_blank">${response.short_url}</a></p>
                        <div>
                             <img src="${response.qr_code_path}" alt="QR Code" class="mt-2 border p-1 bg-white" style="width:150px;height:150px;">
                         </div>
                    `); 
                }
            },
            error: function(xhr) {
                if (xhr.status === 422) { // validation error
                    let errors = xhr.responseJSON.errors;
                    alert(Object.values(errors).join("\n"));
                } else {
                    alert('Server error occurred.');
                }
            }
        });
    }); --}}


        </script> 

        <script>
            document.querySelectorAll('input[name="link_type"]').forEach(radio=>{
                radio.addEventListener(
                    'change',function(){
                        document.getElementById('custom-code-field').style.display = 
                        this.value === 'custom' ? 'block' : 'none';
                    });
            });
        </script>

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

        

    </div>
    
</body>
</html>