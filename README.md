# Flalingo - English Learning Analysis Platform

Flalingo is a web application that analyzes English learning conversations and provides detailed feedback on student performance. The system processes transcripts from various sources (Gladia, OpenAI, and Zoom) and generates comprehensive analysis reports.

## Features

- Upload and process conversation transcripts (CSV and TXT formats)
- Analyze English language proficiency
- Generate detailed feedback reports
- Track student progress
- Support for multiple transcript sources:
  - Gladia transcription
  - OpenAI analysis
  - Zoom transcripts

## Requirements

- PHP >= 8.0
- Laravel >= 9.0
- MySQL >= 5.7
- Composer
- Node.js & NPM
- XAMPP/WAMP/MAMP (for local development)

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

3. Install JavaScript dependencies:
```bash
npm install
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Configure your database in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=flalingo
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

7. Run database migrations:
```bash
php artisan migrate
```

8. Create storage link:
```bash
php artisan storage:link
```

9. Build assets:
```bash
npm run dev
```

## Configuration

### Flask API Setup

The application requires a Flask API for transcript analysis. Configure the API endpoint in your `.env` file:

```
FLASK_API_URL=http://your-flask-api-url
```

### File Storage

Transcripts are stored in the `storage/app/public/transcripts` directory. Ensure this directory is writable:

```bash
chmod -R 775 storage/app/public/transcripts
```

## Usage

1. Start the development server:
```bash
php artisan serve
```

2. Access the application at `http://localhost:8000`

3. Upload transcripts in either CSV or TXT format:
   - CSV files should contain columns: `gladia_response`, `openai_response`, and `zoom_transcription`
   - TXT files should follow the conversation format:
     ```
     Speaker 1: Hello!
     Speaker 2: Hi, how are you?
     ```

## API Endpoints

- `POST /api/transcripts/upload` - Upload and analyze transcripts
- `GET /api/transcripts/{id}/analysis` - Get analysis results
- `GET /api/transcripts` - List all transcripts
- `GET /api/health-check` - Check system status

## Development

### Running Tests

```bash
php artisan test
```

### Code Style

The project follows PSR-12 coding standards. Run PHP CS Fixer:

```bash
./vendor/bin/php-cs-fixer fix
```

## Troubleshooting

### Common Issues

1. Storage Permission Issues:
```bash
chmod -R 775 storage bootstrap/cache
```

2. Composer Dependencies:
```bash
composer dump-autoload
```

3. Clear Application Cache:
```bash
php artisan cache:clear
php artisan config:clear
```

### Error Logs

Check the following log files for errors:
- Laravel Logs: `storage/logs/laravel.log`
- PHP Error Logs: Check your local server's error logs

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
