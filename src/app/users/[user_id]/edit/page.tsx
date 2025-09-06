'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useUser, useUpdateUser } from '@/hooks/useApi';
import type { User } from '@/lib/api';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.user_id as string);
  const { data: userData, isLoading: userLoading } = useUser(userId);
  const updateUserMutation = useUpdateUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
    position: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  type ExtendedUser = User & { position?: string; phone?: string };

  // Load user data when it's available
  useEffect(() => {
    if (userData) {
      const u = userData as ExtendedUser;
      setFormData({
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department || '',
        position: u.position || '',
        phone: u.phone || '',
      });
    }
  }, [userData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await updateUserMutation.mutateAsync({ userId, userData: formData });
      router.push(`/users/${userId}`);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">User not found.</p>
        <Link href="/users">
          <Button className="mt-4">Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/users/${userId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">Update user information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border rounded-lg p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Role and Department */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Role and Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role *
                </label>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className={errors.role ? 'border-destructive' : ''}
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                  <option value="viewer">Viewer</option>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive mt-1">{errors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Department *
                </label>
                <Input
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Enter department"
                  className={errors.department ? 'border-destructive' : ''}
                />
                {errors.department && (
                  <p className="text-sm text-destructive mt-1">{errors.department}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Position *
                </label>
                <Input
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Enter job position"
                  className={errors.position ? 'border-destructive' : ''}
                />
                {errors.position && (
                  <p className="text-sm text-destructive mt-1">{errors.position}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/users/${userId}`}>
            <Button variant="outline" type="button">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={updateUserMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </div>
  );
}
