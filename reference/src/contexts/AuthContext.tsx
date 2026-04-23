import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  signupDate: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const storedUsers = localStorage.getItem('registered_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    const user = users.find((u: User & { password: string }) => 
      u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    const storedUsers = localStorage.getItem('registered_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    
    const existingUser = users.find((u: User & { password: string }) => u.email === email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      signupDate: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth_user');
  };

  const updateProfile = async (name: string, email: string): Promise<void> => {
    if (!currentUser) throw new Error('Not logged in');

    const storedUsers = localStorage.getItem('registered_users');
    const users: (User & { password: string })[] = storedUsers ? JSON.parse(storedUsers) : [];

    // Check email conflict (another user already has that email)
    const conflict = users.find((u) => u.email === email && u.id !== currentUser.id);
    if (conflict) throw new Error('Email already in use by another account');

    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, name, email } : u
    );
    localStorage.setItem('registered_users', JSON.stringify(updatedUsers));

    const updatedUser = { ...currentUser, name, email };
    setCurrentUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!currentUser) throw new Error('Not logged in');

    const storedUsers = localStorage.getItem('registered_users');
    const users: (User & { password: string })[] = storedUsers ? JSON.parse(storedUsers) : [];

    const user = users.find((u) => u.id === currentUser.id);
    if (!user) throw new Error('User not found');
    if (user.password !== currentPassword) throw new Error('Current password is incorrect');

    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, password: newPassword } : u
    );
    localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
    updatePassword,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}