<?php
/**
 * Application Configuration
 *
 * Central configuration file for the portfolio application
 */

// Environment
define('ENV', getenv('ENV') ?: 'production');
define('DEBUG_MODE', ENV === 'development');

// Email Configuration
define('RECIPIENT_EMAIL', getenv('RECIPIENT_EMAIL') ?: 'sefagoevercin@hotmail.de');
define('SENDER_NAME', 'Sefa Gövercin Portfolio');
define('SENDER_EMAIL', 'noreply@sefa-goevercin.de');

// Security Configuration
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_MAX_ATTEMPTS', 5);
define('RATE_LIMIT_WINDOW', 3600); // 1 hour in seconds

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'https://9sefa9.github.io',
    'https://sefa-goevercin.de',
    'http://localhost:8080',
    'http://localhost:3000'
]);

// File Paths
define('BASE_PATH', __DIR__);
define('LOGS_PATH', BASE_PATH . '/logs');
define('INCLUDES_PATH', BASE_PATH . '/includes');

// Ensure required directories exist
if (!is_dir(LOGS_PATH)) {
    mkdir(LOGS_PATH, 0755, true);
}

// Session Configuration
ini_set('session.cookie_secure', ENV === 'production');
ini_set('session.cookie_httponly', true);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_only_cookies', true);

// Error Reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(E_ALL & ~E_NOTICE);
    ini_set('display_errors', '0');
}

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

// CORS Headers (if needed)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    if (in_array($origin, ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }
}

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Helper functions
function isDevelopment() {
    return DEBUG_MODE;
}

function isProduction() {
    return !DEBUG_MODE;
}

function getEnv($key, $default = null) {
    return getenv($key) ?: $default;
}
?>
