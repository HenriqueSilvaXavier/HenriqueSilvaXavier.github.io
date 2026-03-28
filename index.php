<?php
// ==============================
// CONFIGURAÇÃO DE CONEXÃO
// ==============================
$server = "tcp:server-teste1.database.windows.net,1433";
$database = "banco-teste";
$user = "henrique";
$password = "SUA_SENHA_AQUI";

try {
    $conn = new PDO("sqlsrv:server=$server;Database=$database", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}

// ==============================
// CRIAR TABELA (auto setup)
// ==============================
$conn->exec("IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios' AND xtype='U')
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL
)");

// ==============================
// CREATE
// ==============================
if (isset($_POST['criar'])) {
    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email) VALUES (:nome, :email)");
    $stmt->execute([
        ':nome' => $_POST['nome'],
        ':email' => $_POST['email']
    ]);
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// ==============================
// DELETE
// ==============================
if (isset($_GET['deletar'])) {
    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = :id");
    $stmt->execute([':id' => $_GET['deletar']]);
    header("Location: " . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

// ==============================
// READ
// ==============================
$stmt = $conn->query("SELECT * FROM usuarios ORDER BY id DESC");
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>CRUD Azure SQL + PHP</title>
<style>
body { font-family: Arial; background:#f4f6f8; padding:40px }
.container { max-width:800px; margin:auto; background:white; padding:24px; border-radius:12px }
h1 { margin-top:0 }
form { display:flex; gap:12px; margin-bottom:20px }
input { padding:8px; flex:1 }
button { padding:8px 14px; cursor:pointer }
table { width:100%; border-collapse:collapse }
th, td { border:1px solid #ddd; padding:8px; text-align:left }
th { background:#eee }
.actions a { color:red; text-decoration:none }
</style>
</head>
<body>
<div class="container">
    <h1>👤 Usuários</h1>

    <form method="POST">
        <input name="nome" placeholder="Nome" required>
        <input name="email" placeholder="Email" required>
        <button name="criar">Adicionar</button>
    </form>

    <table>
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
        </tr>
        <?php foreach ($usuarios as $u): ?>
        <tr>
            <td><?= $u['id'] ?></td>
            <td><?= htmlspecialchars($u['nome']) ?></td>
            <td><?= htmlspecialchars($u['email']) ?></td>
            <td class="actions">
                <a href="?deletar=<?= $u['id'] ?>" onclick="return confirm('Excluir usuário?')">Excluir</a>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
</div>
</body>
</html>