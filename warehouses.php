<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = "localhost";
$username = "root";
$password = "";
$database = "inventory";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed"]));
}

$sql = "SELECT * FROM warehouses";
$result = $conn->query($sql);

$warehouses = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $warehouses[] = $row;
    }
}

echo json_encode($warehouses);

$conn->close();
?>
