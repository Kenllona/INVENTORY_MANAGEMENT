<?php
require 'db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? '';
    $barcode = $_POST['barcode'] ?? '';
    $category = $_POST['category'] ?? '';
    $warehouse = $_POST['warehouse'] ?? '';
    $stock = $_POST['stock'] ?? '';
    $low_stock_threshold = $_POST['low_stock_threshold'] ?? 10;
    
    if (empty($name) || empty($price) || empty($barcode) || empty($category) || empty($warehouse) || empty($stock)) {
        echo json_encode(["status" => "error", "message" => "Missing fields"]);
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

   
    $stmt = $pdo->prepare("INSERT INTO products (name, price, barcode, category_id, warehouse_id, stock, low_stock_threshold, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $price, $barcode, $category, $warehouse, $stock, $low_stock_threshold, $image_path]);
      
    echo json_encode(["status" => "success", "message" => "Product added successfully"]);
    exit();
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("
        SELECT 
            p.id, p.name, p.price, p.barcode, p.stock, p.image, p.low_stock_threshold,
            c.name AS category,
            w.name AS warehouse
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN warehouses w ON p.warehouse_id = w.id
    ");

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    
    $baseUrl = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/";
    foreach ($products as &$product) {
        if (!empty($product['image'])) {
            $product['image'] = $baseUrl . $product['image'];
        }
    }

    echo json_encode($products);
}
?>
