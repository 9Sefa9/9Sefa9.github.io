<?php
/**
 * Secure Contact Form Handler
 *
 * Features:
 * - Input validation and sanitization
 * - CSRF protection
 * - Rate limiting
 * - Email verification
 * - Security headers
 * - Error logging
 */

// Include configuration and utilities
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/error-handler.php';

// Initialize logger and error handler
$logger = getLogger(LOGS_PATH);
$errorHandler = getErrorHandler($logger, DEBUG_MODE);
$errorHandler->register();

// Security headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ErrorHandler::sendJsonError(405, 'Method not allowed');
}

// Check for AJAX request
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

if (!$isAjax) {
    ErrorHandler::sendJsonError(403, 'Invalid request');
}

// Rate limiting
function checkRateLimit($ipAddress) {
    if (!RATE_LIMIT_ENABLED) {
        return true;
    }

    $cacheFile = sys_get_temp_dir() . '/contact_form_' . md5($ipAddress) . '.json';
    $attempts = [];

    if (file_exists($cacheFile)) {
        $data = file_get_contents($cacheFile);
        $attempts = json_decode($data, true) ?: [];

        // Remove old attempts outside the time window
        $attempts = array_filter($attempts, function($timestamp) {
            return (time() - $timestamp) < RATE_LIMIT_WINDOW;
        });
    }

    if (count($attempts) >= RATE_LIMIT_MAX_ATTEMPTS) {
        return false;
    }

    $attempts[] = time();
    file_put_contents($cacheFile, json_encode($attempts), LOCK_EX);

    return true;
}

// Validate form data
function validateContactForm() {
    $errors = [];

    // Name validation
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $nameValidation = RequestValidator::validateText($name, 2, 100);
    if (!$nameValidation['valid']) {
        $errors['name'] = $nameValidation['error'];
    } elseif (!preg_match('/^[a-zA-Z\s\'-]+$/u', $name)) {
        $errors['name'] = 'Name contains invalid characters';
    }

    // Email validation
    $email = isset($_POST['email']) ? trim(strtolower($_POST['email'])) : '';
    $emailValidation = RequestValidator::validateEmail($email);
    if (!$emailValidation['valid']) {
        $errors['email'] = $emailValidation['error'];
    }

    // Subject validation
    $subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
    $subjectValidation = RequestValidator::validateText($subject, 3, 200);
    if (!$subjectValidation['valid']) {
        $errors['subject'] = $subjectValidation['error'];
    }

    // Message validation
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    $messageValidation = RequestValidator::validateText($message, 10, 5000);
    if (!$messageValidation['valid']) {
        $errors['message'] = $messageValidation['error'];
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'data' => [
            'name' => RequestValidator::sanitizeText($name),
            'email' => filter_var($email, FILTER_SANITIZE_EMAIL),
            'subject' => RequestValidator::sanitizeText($subject),
            'message' => RequestValidator::sanitizeText($message)
        ]
    ];
}

try {
    // Get client IP
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

    // Check rate limit
    if (!checkRateLimit($clientIp)) {
        $logger->warning('Rate limit exceeded', ['ip' => $clientIp]);
        ErrorHandler::sendJsonError(
            429,
            'Too many requests. Please try again later.',
            ['retry_after' => RATE_LIMIT_WINDOW]
        );
    }

    // Validate form data
    $validation = validateContactForm();

    if (!$validation['valid']) {
        $logger->warning('Form validation failed', $validation['errors']);
        ErrorHandler::sendJsonError(400, 'Please check your input and try again.', $validation['errors']);
    }

    $formData = $validation['data'];

    // Prepare email
    $recipientEmail = filter_var(RECIPIENT_EMAIL, FILTER_VALIDATE_EMAIL);
    if (!$recipientEmail) {
        throw new Exception('Invalid recipient email configuration');
    }

    // Email headers
    $headers = [
        'From: ' . $formData['email'],
        'Reply-To: ' . $formData['email'],
        'Return-Path: ' . SENDER_EMAIL,
        'Content-Type: text/plain; charset=utf-8',
        'X-Mailer: Portfolio Contact Form',
        'X-Priority: 3'
    ];

    // Email subject
    $emailSubject = '[Portfolio Contact] ' . $formData['subject'];

    // Email body
    $emailBody = sprintf(
        "New contact form submission\n\n" .
        "From: %s <%s>\n" .
        "Subject: %s\n" .
        "Submitted: %s\n" .
        "IP Address: %s\n\n" .
        "Message:\n%s\n\n" .
        "---\n" .
        "This message was sent from https://9sefa9.github.io\n" .
        "Please reply directly to the sender's email address.",
        $formData['name'],
        $formData['email'],
        $formData['subject'],
        date('Y-m-d H:i:s'),
        $clientIp,
        $formData['message']
    );

    // Send email
    $mailSent = @mail(
        $recipientEmail,
        $emailSubject,
        $emailBody,
        implode("\r\n", $headers)
    );

    if (!$mailSent) {
        throw new Exception('Failed to send email. Please try again later.');
    }

    // Log successful submission
    $logger->info('Contact form submitted successfully', [
        'name' => $formData['name'],
        'email' => $formData['email'],
        'subject' => $formData['subject']
    ]);

    // Send success response
    ErrorHandler::sendJsonSuccess(
        ['message_id' => uniqid('msg_')],
        'Thank you! Your message has been sent successfully. I\'ll get back to you soon.'
    );

} catch (Exception $e) {
    // Log error
    $logger->error('Exception occurred', [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);

    // Send error response (don't leak sensitive info)
    ErrorHandler::sendJsonError(500, 'An error occurred. Please try again later.');
