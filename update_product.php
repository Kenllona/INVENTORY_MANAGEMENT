<?php
require 'db.php'; 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? '';
    $barcode = $_POST['barcode'] ?? '';
    $category = $_POST['category'] ?? '';
    $warehouse = $_POST['warehouse'] ?? '';
    $stock = $_POST['stock'] ?? '';
    $low_stock_threshold = $_POST['low_stock_threshold'] ?? 10;

    if (empty($id) || empty($name) || empty($price) || empty($barcode) || empty($category) || empty($warehouse) || empty($stock)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit();
    }

    $image_path = null;

    if (!empty($_FILES['image']['name'])) {
        $targetDir = "uploads/";
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        $fileName = basename($_FILES["image"]["name"]);
        $targetFilePath = $targetDir . time() . "_" . $fileName;
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
        if (in_array($fileType, $allowedTypes)) {
            if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
                $image_path = $targetFilePath;
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to upload image"]);
                exit();
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid image file type"]);
            exit();
        }
    }

    try {
        if ($image_path) {
            $stmt = $pdo->prepare("
                UPDATE products 
                SET name = ?, price = ?, barcode = ?, category_id = ?, warehouse_id = ?, stock = ?, low_stock_threshold = ?, image = ?
                WHERE id = ?
            ");
            $stmt->execute([$name, $price, $barcode, $category, $warehouse, $stock, $low_stock_threshold, $image_path, $id]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE products 
                SET name = ?, price = ?, barcode = ?, category_id = ?, warehouse_id = ?, stock = ?, low_stock_threshold = ?
                WHERE id = ?
            ");
            $stmt->execute([$name, $price, $barcode, $category, $warehouse, $stock, $low_stock_threshold, $id]);
        }

        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "message" => "Product updated successfully"]);
        } else {
            echo json_encode([
                "status" => "error", 
                "message" => "Update failed: No changes or invalid product ID"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Update failed", "error" => $e->getMessage()]);
    }
}
?>
