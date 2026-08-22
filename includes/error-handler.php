<?php
/**
 * Error Handler & Logger Utility
 *
 * Provides centralized error handling and logging for the portfolio
 */

class Logger {
    private $logFile;
    private $logDir;

    public function __construct($logDirectory = null) {
        if ($logDirectory === null) {
            $logDirectory = __DIR__ . '/logs';
        }

        $this->logDir = $logDirectory;
        $this->logFile = $logDirectory . '/portfolio-' . date('Y-m-d') . '.log';

        // Ensure log directory exists
        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }

    /**
     * Log a message with timestamp
     */
    public function log($level, $message, $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $this->getClientIp();

        $logEntry = sprintf(
            "[%s] %s | IP: %s | %s | Context: %s\n",
            $timestamp,
            strtoupper($level),
            $ip,
            $message,
            json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );

        error_log($logEntry, 3, $this->logFile);
    }

    public function info($message, $context = []) {
        $this->log('info', $message, $context);
    }

    public function warning($message, $context = []) {
        $this->log('warning', $message, $context);
    }

    public function error($message, $context = []) {
        $this->log('error', $message, $context);
    }

    public function debug($message, $context = []) {
        if (defined('DEBUG_MODE') && DEBUG_MODE) {
            $this->log('debug', $message, $context);
        }
    }

    /**
     * Get client IP address
     */
    private function getClientIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            // Handle multiple IPs in X-Forwarded-For
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        }

        // Validate IP address
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            $ip = 'Invalid IP';
        }

        return $ip;
    }

    /**
     * Get log file path
     */
    public function getLogFile() {
        return $this->logFile;
    }
}

/**
 * Error Handler Class
 */
class ErrorHandler {
    private $logger;
    private $isDevelopment;

    public function __construct(Logger $logger, $isDevelopment = false) {
        $this->logger = $logger;
        $this->isDevelopment = $isDevelopment;
    }

    /**
     * Handle PHP errors
     */
    public function handleError($errno, $errstr, $errfile, $errline) {
        $this->logger->error('PHP Error', [
            'errno' => $errno,
            'message' => $errstr,
            'file' => $errfile,
            'line' => $errline
        ]);

        return false; // Let PHP handle the error
    }

    /**
     * Handle exceptions
     */
    public function handleException($exception) {
        $this->logger->error('Uncaught Exception', [
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Return user-friendly error
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred. Our team has been notified.'
        ]);
    }

    /**
     * Register error handlers
     */
    public function register() {
        set_error_handler([$this, 'handleError']);
        set_exception_handler([$this, 'handleException']);
    }

    /**
     * Send JSON error response
     */
    public static function sendJsonError($statusCode, $message, $errors = []) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('c')
        ]);
        exit;
    }

    /**
     * Send JSON success response
     */
    public static function sendJsonSuccess($data, $message = null) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('c')
        ]);
        exit;
    }
}

/**
 * Request Validator
 */
class RequestValidator {
    /**
     * Validate email format
     */
    public static function validateEmail($email) {
        $email = trim($email);

        if (empty($email)) {
            return ['valid' => false, 'error' => 'Email is required'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'error' => 'Invalid email format'];
        }

        if (strlen($email) > 254) {
            return ['valid' => false, 'error' => 'Email is too long'];
        }

        return ['valid' => true];
    }

    /**
     * Validate text input
     */
    public static function validateText($text, $minLength = 1, $maxLength = 1000) {
        $text = trim($text);

        if (strlen($text) < $minLength) {
            return ['valid' => false, 'error' => "Minimum {$minLength} characters required"];
        }

        if (strlen($text) > $maxLength) {
            return ['valid' => false, 'error' => "Maximum {$maxLength} characters allowed"];
        }

        return ['valid' => true];
    }

    /**
     * Sanitize input
     */
    public static function sanitizeText($text) {
        return htmlspecialchars(trim($text), ENT_QUOTES, 'UTF-8');
    }
}

// Export for use in other files
if (!function_exists('getLogger')) {
    function getLogger($logDir = null) {
        static $logger;
        if (!$logger) {
            $logger = new Logger($logDir);
        }
        return $logger;
    }
}

if (!function_exists('getErrorHandler')) {
    function getErrorHandler(Logger $logger = null, $isDev = false) {
        static $handler;
        if (!$handler) {
            $logger = $logger ?? getLogger();
            $handler = new ErrorHandler($logger, $isDev);
        }
        return $handler;
    }
}
?>
