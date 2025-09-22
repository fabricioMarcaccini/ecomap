import { useState, useEffect } from 'react';
import Admin from '@/react-app/components/Admin';
import AdminLogin from '@/react-app/components/AdminLogin';

export default function AdminPage() {
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  useEffect(() => {
    // Verificar se admin já foi verificado anteriormente
    const adminAccess = localStorage.getItem('adminAccess');
    if (adminAccess === 'verified') {
      setIsAdminVerified(true);
    }
  }, []);

  const handleAdminVerified = () => {
    setIsAdminVerified(true);
  };

  // Se não foi verificado como admin, mostrar tela de login
  if (!isAdminVerified) {
    return <AdminLogin onAdminVerified={handleAdminVerified} />;
  }

  // Se foi verificado, mostrar painel admin
  return <Admin />;
}
