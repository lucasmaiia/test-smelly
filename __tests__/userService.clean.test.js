const { UserService } = require('../src/userService');

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  // --- createUser ---

  describe('createUser', () => {
    test('deve retornar um usuário com id gerado ao ser criado', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuario = userService.createUser(nome, email, idade);

      // Assert
      expect(usuario.id).toBeDefined();
    });

    test('deve criar usuário com status ativo por padrão', () => {
      // Arrange & Act
      const usuario = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Assert
      expect(usuario.status).toBe('ativo');
    });

    test('deve lançar erro ao tentar criar usuário menor de idade', () => {
      // Arrange, Act & Assert
      expect(() => {
        userService.createUser('Menor', 'menor@email.com', 17);
      }).toThrow('O usuário deve ser maior de idade.');
    });
  });

  // --- getUserById ---

  describe('getUserById', () => {
    test('deve retornar o usuário correto pelo id', () => {
      // Arrange
      const usuarioCriado = userService.createUser('Fulano de Tal', 'fulano@teste.com', 25);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado.nome).toBe('Fulano de Tal');
    });

    test('deve retornar null ao buscar por id inexistente', () => {
      // Act
      const resultado = userService.getUserById('id-inexistente');

      // Assert
      expect(resultado).toBeNull();
    });
  });

  // --- deactivateUser ---

  describe('deactivateUser', () => {
    test('deve desativar um usuário comum e retornar true', () => {
      // Arrange
      const usuario = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuario.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('deve alterar o status do usuário comum para inativo', () => {
      // Arrange
      const usuario = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuario.id);
      const usuarioAtualizado = userService.getUserById(usuario.id);

      // Assert
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('não deve desativar um administrador e retornar false', () => {
      // Arrange
      const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(admin.id);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  // --- generateUserReport ---

  describe('generateUserReport', () => {
    test('deve informar que não há usuários quando o banco está vazio', () => {
      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado');
    });

    test('deve incluir o id do usuário no relatório', () => {
      // Arrange
      const usuario = userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(usuario.id);
    });

    test('deve incluir o nome do usuário no relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Alice');
    });

    test('deve incluir o status do usuário no relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('ativo');
    });
  });
});
