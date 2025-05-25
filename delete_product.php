<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Product ID is required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $success = $stmt->execute([$id]);

        if ($success) {
            echo json_encode(['status' => 'success', 'message' => 'Product deleted successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete product.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
