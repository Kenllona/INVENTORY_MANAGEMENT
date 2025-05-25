<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');


$data = json_decode(file_get_contents("php://input"), true);


if (!isset($data['barcode'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Barcode is required"
    ]);
    exit;
}

$barcode = $data['barcode'];

$host = 'localhost';
$db = 'inventory';
$user = 'root';
$pass = ''; 

$conn = new mysqli($host, $user, $pass, $db);


if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM products WHERE barcode = ?");
$stmt->bind_param("s", $barcode);
$stmt->execute();
$result = $stmt->get_result();


$baseImageUrl = 'http://localhost/inventory/uploads/';

$products = [];
while ($row = $result->fetch_assoc()) {
   
    if (!empty($row['image'])) {
        $row['image'] = $baseImageUrl . $row['image'];
    } else {
        $row['image'] = '';
    }

    $products[] = $row;
}

if (count($products) > 0) {
    echo json_encode([
        "status" => "success",
        "products" => $products
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Product not found"
    ]);
}

$stmt->close();
$conn->close();
?>
