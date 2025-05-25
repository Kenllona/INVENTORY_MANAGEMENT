<?php
require 'db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$stmt = $pdo->query("
  SELECT 
    p.id, p.name, p.barcode, p.stock, p.low_stock_threshold,
    c.name AS category,
    w.name AS warehouse
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN warehouses w ON p.warehouse_id = w.id
  WHERE p.stock <= p.low_stock_threshold
");

$lowStock = $stmt->fetchAll();
echo json_encode($lowStock);
