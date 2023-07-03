// this is mail form template for mailog web server. we use this for send log to mail
let form = `<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Add Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

    <style>
        /* Custom CSS styles */
        body {
            background-color: #f8f9fa;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        h1 {
            font-size: 32px;
            margin-bottom: 20px;
            color: #333;
        }

        hr {
            margin: 20px 0;
            height: 2px;
            background-color: #00a3ff;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
            border: none;
        }

        h2 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
        }

        p {
            color: #666;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1 class="text-center">Mailog</h1>

        <hr>

            <div class="col-md-6">
                <h2>Time</h2>
                <p class="fw-bold">{{time}}</p>
            </div>
            <hr>
            <div class="col-md-6">
                <h2>Level</h2>
                <p class="fw-bold">{{level}}</p>
            </div>

        <hr>

        <div class="row">
            <div class="col">
                <h2>Message</h2>
                <p>{{message}}</p>
            </div>
        </div>
    </div>

    <!-- Add Bootstrap JS (if needed) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
`

export default form;