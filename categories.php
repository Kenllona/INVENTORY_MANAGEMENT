<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$password = ''; 
$dbname = 'inventory'; 

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = intval($input['id']);

    $stmt = $conn->prepare("SELECT image_url FROM categories WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->bind_result($image_url);
    if ($stmt->fetch() && $image_url) {
        $image_path = __DIR__ . "/uploads/" . $image_url;
        if (file_exists($image_path)) unlink($image_path);
    }
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Delete failed']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $action = $_POST['action'] ?? '';
    $id = isset($_POST['id']) ? intval($_POST['id']) : null;
    $imageUrl = null;

    if (!empty($_FILES['image']['name'])) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $filename = uniqid() . '_' . basename($_FILES['image']['name']);
        $targetFile = $uploadDir . $filename;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $imageUrl = $filename;
        }
    }

    if ($action === 'create') {
        $stmt = $conn->prepare("INSERT INTO categories (name, image_url) VALUES (?, ?)");
        $stmt->bind_param('ss', $name, $imageUrl);
    } elseif ($action === 'update') {
        if ($imageUrl) {
           
            $old = $conn->prepare("SELECT image_url FROM categories WHERE id = ?");
            $old->bind_param('i', $id);
            $old->execute();
            $old->bind_result($oldImage);
            if ($old->fetch() && $oldImage) {
                $oldPath = __DIR__ . "/uploads/" . $oldImage;
                if (file_exists($oldPath)) unlink($oldPath);
            }
            $old->close();

            $stmt = $conn->prepare("UPDATE categories SET name = ?, image_url = ? WHERE id = ?");
            $stmt->bind_param('ssi', $name, $imageUrl, $id);
        } else {
            $stmt = $conn->prepare("UPDATE categories SET name = ? WHERE id = ?");
            $stmt->bind_param('si', $name, $id);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        exit;
    }

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }

    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM categories ORDER BY id DESC");
    $categories = [];

    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }

    echo json_encode(['status' => 'success', 'categories' => $categories]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Unsupported request method']);
exit;
?>
