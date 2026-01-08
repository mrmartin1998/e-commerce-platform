import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js server
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data, options) => ({
      json: async () => data,
      ok: !options || options.status < 400,
      status: options?.status || 200
    })
  }
}));

// Mock database connection
vi.mock('@/lib/db/mongoose', () => ({
  default: vi.fn(() => Promise.resolve())
}));

// Mock JWT
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload) => `mock-token-${payload.userId}`),
    verify: vi.fn((token) => ({ userId: 'mock-user-id', email: 'test@example.com' }))
  }
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((password) => Promise.resolve(`hashed-${password}`)),
    compare: vi.fn((password, hash) => 
      Promise.resolve(hash === `hashed-${password}`)
    )
  }
}));

// Mock User model
const mockUserModel = {
  findOne: vi.fn(),
  create: vi.fn(),
  findById: vi.fn()
};

vi.mock('@/lib/models', () => ({
  User: mockUserModel,
  TokenBlacklist: {
    create: vi.fn(() => Promise.resolve())
  }
}));

// Mock auth middleware
vi.mock('@/lib/middleware/auth', () => ({
  requireAuth: (handler) => handler
}));

describe('Authentication API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('creates a new user with valid data', async () => {
      const newUser = {
        _id: 'new-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password123'
      };

      mockUserModel.findOne.mockResolvedValue(null); // No existing user
      mockUserModel.create.mockResolvedValue(newUser);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        })
      };

      const { POST } = await import('@/app/api/auth/register/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('john@example.com');
    });

    it('rejects registration with missing fields', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com'
          // Missing name and password
        })
      };

      const { POST } = await import('@/app/api/auth/register/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Missing required fields');
    });

    it('rejects registration with existing email', async () => {
      mockUserModel.findOne.mockResolvedValue({ 
        email: 'existing@example.com' 
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        })
      };

      const { POST } = await import('@/app/api/auth/register/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Email already registered');
    });

    it('hashes password before storing', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'user-id',
        name: 'Test',
        email: 'test@example.com'
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          name: 'Test User',
          email: 'test@example.com',
          password: 'plainPassword'
        })
      };

      const { POST } = await import('@/app/api/auth/register/route');
      await POST(mockRequest);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in user with valid credentials', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashed-password123',
        role: 'user'
      };

      mockUserModel.findOne.mockResolvedValue(user);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'user@example.com',
          password: 'password123'
        })
      };

      const { POST } = await import('@/app/api/auth/login/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('user@example.com');
    });

    it('rejects login with missing email', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          password: 'password123'
        })
      };

      const { POST } = await import('@/app/api/auth/login/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Email and password are required');
    });

    it('rejects login with missing password', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'user@example.com'
        })
      };

      const { POST } = await import('@/app/api/auth/login/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Email and password are required');
    });

    it('rejects login with non-existent user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
      };

      const { POST } = await import('@/app/api/auth/login/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });

    it('rejects login with incorrect password', async () => {
      mockUserModel.findOne.mockResolvedValue({
        _id: 'user-123',
        email: 'user@example.com',
        password: 'hashed-correctPassword'
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'user@example.com',
          password: 'wrongPassword'
        })
      };

      const { POST } = await import('@/app/api/auth/login/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });

    it('generates JWT token with 7 day expiration', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      
      mockUserModel.findOne.mockResolvedValue({
        _id: 'user-123',
        email: 'user@example.com',
        password: 'hashed-password123'
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'user@example.com',
          password: 'password123'
        })
      };

      const { POST } = await import('@/app/api/auth/login/route');
      await POST(mockRequest);

      // Check that jwt.sign was called with expiresIn: '7d'
      const signCall = jwt.sign.mock.calls[0];
      expect(signCall[2]).toEqual({ expiresIn: '7d' });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('successfully logs out authenticated user', async () => {
      const mockRequest = {
        headers: {
          get: vi.fn((key) => {
            if (key === 'Authorization') return 'Bearer mock-token-123';
            return null;
          })
        },
        user: {
          _id: 'user-123'
        }
      };

      const { TokenBlacklist } = await import('@/lib/models');
      
      const { POST } = await import('@/app/api/auth/logout/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.message).toBe('Logged out successfully');
      expect(TokenBlacklist.create).toHaveBeenCalled();
    });

    it('rejects logout without token', async () => {
      const mockRequest = {
        headers: {
          get: vi.fn(() => null)
        }
      };

      const { POST } = await import('@/app/api/auth/logout/route');
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('No token provided');
    });

    it('adds token to blacklist on logout', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const { TokenBlacklist } = await import('@/lib/models');
      
      jwt.verify.mockReturnValue({
        userId: 'user-123',
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now
      });

      const mockRequest = {
        headers: {
          get: vi.fn(() => 'Bearer valid-token')
        }
      };

      const { POST } = await import('@/app/api/auth/logout/route');
      await POST(mockRequest);

      expect(TokenBlacklist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'valid-token',
          userId: 'user-123'
        })
      );
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns authenticated user data', async () => {
      const mockRequest = {
        user: {
          _id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'user',
          addresses: []
        }
      };

      const { GET } = await import('@/app/api/auth/me/route');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('user@example.com');
      expect(data.user.name).toBe('Test User');
    });

    it('includes user role in response', async () => {
      const mockRequest = {
        user: {
          _id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          addresses: []
        }
      };

      const { GET } = await import('@/app/api/auth/me/route');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.user.role).toBe('admin');
    });

    it('includes user addresses in response', async () => {
      const mockRequest = {
        user: {
          _id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'user',
          addresses: [
            { street: '123 Main St', city: 'New York', country: 'USA' }
          ]
        }
      };

      const { GET } = await import('@/app/api/auth/me/route');
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.user.addresses).toHaveLength(1);
      expect(data.user.addresses[0].city).toBe('New York');
    });
  });

  describe('Authentication Flow', () => {
    it('completes full register-login-logout flow', async () => {
      // 1. Register
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'new-user',
        email: 'newuser@example.com',
        name: 'New User'
      });

      const registerRequest = {
        json: vi.fn().mockResolvedValue({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123'
        })
      };

      const { POST: registerPOST } = await import('@/app/api/auth/register/route');
      const registerResponse = await registerPOST(registerRequest);
      const registerData = await registerResponse.json();
      
      expect(registerData.token).toBeDefined();
      
      // 2. Login
      mockUserModel.findOne.mockResolvedValue({
        _id: 'new-user',
        email: 'newuser@example.com',
        password: 'hashed-password123'
      });

      const loginRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'newuser@example.com',
          password: 'password123'
        })
      };

      const { POST: loginPOST } = await import('@/app/api/auth/login/route');
      const loginResponse = await loginPOST(loginRequest);
      const loginData = await loginResponse.json();
      
      expect(loginData.token).toBeDefined();
      
      // 3. Logout
      const logoutRequest = {
        headers: {
          get: vi.fn(() => `Bearer ${loginData.token}`)
        }
      };

      const { POST: logoutPOST } = await import('@/app/api/auth/logout/route');
      const logoutResponse = await logoutPOST(logoutRequest);
      const logoutData = await logoutResponse.json();
      
      expect(logoutData.message).toBe('Logged out successfully');
    });

    it('maintains user session across requests', async () => {
      const user = {
        _id: 'user-123',
        email: 'user@example.com',
        password: 'hashed-password123',
        name: 'Test User',
        role: 'user',
        addresses: []
      };

      // Login
      mockUserModel.findOne.mockResolvedValue(user);
      const loginRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'user@example.com',
          password: 'password123'
        })
      };

      const { POST: loginPOST } = await import('@/app/api/auth/login/route');
      const loginResponse = await loginPOST(loginRequest);
      const loginData = await loginResponse.json();

      // Use token to access protected route
      const meRequest = {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          addresses: user.addresses
        }
      };

      const { GET: meGET } = await import('@/app/api/auth/me/route');
      const meResponse = await meGET(meRequest);
      const meData = await meResponse.json();

      expect(meData.user.email).toBe(loginData.user.email);
    });
  });

  describe('Security', () => {
    it('password is hashed before storage', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'user-123',
        email: 'user@example.com',
        name: 'Test User'
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          name: 'Test User',
          email: 'user@example.com',
          password: 'plainPassword'
        })
      };

      const { POST } = await import('@/app/api/auth/register/route');
      await POST(mockRequest);

      // Verify password was hashed, not stored in plain text
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
    });

    it('compares passwords securely using bcrypt', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      
      mockUserModel.findOne.mockResolvedValue({
        _id: 'user-123',
        email: 'user@example.com',
        password: 'hashed-password123'
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'user@example.com',
          password: 'password123'
        })
      };

      const { POST } = await import('@/app/api/auth/login/route');
      await POST(mockRequest);

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password123');
    });
  });
});
