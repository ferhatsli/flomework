# Flalingo - Transcript Analysis Tool

Flalingo is a web application that analyzes conversation transcripts and provides insights, along with generating practice tests based on the content.

## Features

- Upload conversation transcripts (TXT, CSV, PDF, DOC, DOCX)
- Automatic conversation analysis
- Test generation based on transcript content
- Interactive test-taking interface
- Beautiful and responsive UI

## Requirements

- PHP >= 8.1
- Composer
- Node.js >= 16
- MySQL/MariaDB
- Python 3.8+ (for Flask API)
- XAMPP/WAMP/MAMP or similar (for local development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/flalingo.git
cd flalingo
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install Node.js dependencies:
```bash
npm install
```

4. Create a copy of the environment file:
```bash
cp .env.example .env
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Configure your database in the `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=flalingo
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

7. Configure Flask API URL in the `.env` file:
```env
FLASK_API_URL=http://127.0.0.1:5000
```

8. Run database migrations:
```bash
php artisan migrate
```

9. Create storage link:
```bash
php artisan storage:link
```

10. Build frontend assets:
```bash
npm run build
```

## Development

1. Start the Laravel development server:
```bash
php artisan serve
```

2. Start the Vite development server:
```bash
npm run dev
```

3. Make sure the Flask API server is running (see Flask API repository)

## Usage

1. Access the application at `http://localhost:8000`
2. Upload a transcript file
3. View the analysis results
4. Take generated tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Laravel Framework
- Flask API Integration
- Gladia Transcription Service
- OpenAI API
- Zoom API
