'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, Ban, Eye, AlertTriangle } from 'lucide-react';
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'chats' | 'reports'>(
    'users'
  );
  const users = [
  {
    id: 1,
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    status: 'active',
    role: 'user'
  },
  {
    id: 2,
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    status: 'suspended',
    role: 'user'
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@quranpartners.com',
    status: 'active',
    role: 'admin'
  }];

  const reports = [
  {
    id: 1,
    reporter: 'User A',
    reported: 'User B',
    reason: 'Inappropriate language',
    date: '2023-10-25',
    status: 'pending'
  }];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Manage users, monitor chats, and handle reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'users' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white'}`}>

          User Management
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'chats' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white'}`}>

          Chat Monitoring
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'reports' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white'}`}>

          Reports
        </button>
      </div>

      {/* Content */}
      <Card className="p-6 overflow-hidden">
        {activeTab === 'users' &&
        <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="w-64">
                <Input
                placeholder="Search users..."
                leftIcon={<Search className="w-4 h-4" />} />

              </div>
              <Button variant="secondary">Export Data</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-4 pl-4">Name</th>
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) =>
                <tr
                  key={user.id}
                  className="text-sm hover:bg-white/5 transition-colors">

                      <td className="py-4 pl-4 font-medium text-white">
                        {user.name}
                      </td>
                      <td className="py-4 text-gray-300">{user.email}</td>
                      <td className="py-4 text-gray-300 capitalize">
                        {user.role}
                      </td>
                      <td className="py-4">
                        <Badge
                      variant={
                      user.status === 'active' ? 'success' : 'danger'
                      }>

                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/10">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10">
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        }

        {activeTab === 'reports' &&
        <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-4 pl-4">Reporter</th>
                    <th className="pb-4">Reported User</th>
                    <th className="pb-4">Reason</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reports.map((report) =>
                <tr
                  key={report.id}
                  className="text-sm hover:bg-white/5 transition-colors">

                      <td className="py-4 pl-4 text-white">
                        {report.reporter}
                      </td>
                      <td className="py-4 text-white">{report.reported}</td>
                      <td className="py-4 text-gray-300">{report.reason}</td>
                      <td className="py-4 text-gray-300">{report.date}</td>
                      <td className="py-4">
                        <Badge variant="warning">{report.status}</Badge>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <Button size="sm" variant="secondary">
                          Review
                        </Button>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        }

        {activeTab === 'chats' &&
        <div className="text-center py-12 text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />
            <h3 className="text-lg font-bold text-white mb-2">
              Restricted Access
            </h3>
            <p>
              Chat monitoring logs are only available to senior administrators.
            </p>
          </div>
        }
      </Card>
    </DashboardLayout>);

}